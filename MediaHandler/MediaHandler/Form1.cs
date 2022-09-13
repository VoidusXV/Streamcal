using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.IO;
using System.Net;
using System.Diagnostics;
using System.Threading;

namespace MediaHandler
{
    public partial class Form1 : Form
    {

        static WebClient webClient = new WebClient();
        static FileHandler fileHandler = new FileHandler();

        string URL = "https://aniworld.to/anime/stream/kurokos-basketball/staffel-1/episode-1";//"https://anime-base.net/anime/kurokos-basketball";;
        static string currentPath = Directory.GetCurrentDirectory();
        static string processesPath = currentPath + "/Processes";
        static string scrapperPath = currentPath + "/scrapper";

        public Form1()
        {
            InitializeComponent();
            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
        }


        private void button1_Click(object sender, EventArgs e)
        {


            //driver.Quit();
        }

        //void Setup()
        //{

        //    driver = new ChromeDriver();
        //    IDevTools devTools = driver as IDevTools;
        //    session = devTools.GetDevToolsSession();
        //}

        //void Network()
        //{
        //    var domains = session.GetVersionSpecificDomains<DevToolsSessionDomains>();
        //    domains.Network.Enable(new Network.EnableCommandSettings());
        //    domains.Network.SetBlockedURLs(new Network.SetBlockedURLsCommandSettings()
        //    {
        //        Urls = new string[] { "*://*/*.css", "*://*/*.jpg", "*://*/*.png" }
        //    });
        //    driver.Url = URL;

        //}


        private void Form1_FormClosing(object sender, FormClosingEventArgs e)
        {
            Application.Exit();
        }

        void onProcessExited(object sender, EventArgs e)
        {
            eventHandled.TrySetResult(true);
        }
        private TaskCompletionSource<bool> eventHandled;

        async Task RunCmd(string Arguments, string FileName = "cmd.exe", bool hidden = false, bool systemArguments = false)
        {
            Process process = new Process();
            ProcessStartInfo startInfo = new ProcessStartInfo();
            eventHandled = new TaskCompletionSource<bool>();


            startInfo.WindowStyle = !hidden ? ProcessWindowStyle.Normal : ProcessWindowStyle.Hidden;
            startInfo.WorkingDirectory = processesPath;
            startInfo.FileName = FileName;
            startInfo.Arguments = !systemArguments ? Arguments : $"/c {Arguments}";

            process.StartInfo = startInfo;
            process.EnableRaisingEvents = true;
            process.Exited += new EventHandler(onProcessExited);
            process.Start();

            await Task.WhenAny(eventHandled.Task);

            //process.WaitForExit();
        }

        async Task ConvertTsToMp4(string fileName = "")
        {

            AddLog("Merging TS Files...");
            await RunCmd("ffmpeg -f concat -i tsList.txt -c copy all.ts", hidden: true, systemArguments: true);

            AddLog("TS Files successfully merged");
            AddLog("Converting TS To MP4...");

            await RunCmd("ffmpeg -i all.ts -acodec copy -vcodec copy all.mp4", hidden: true, systemArguments: true);
            AddLog("TS To MP4 successfully converted");

        }

        void Create_TsList(string path)
        {

            List<string> filePath = Directory.GetFiles(path).ToList();
            File.Delete(processesPath + "/tsList.txt");
            for (int i = 1; i <= filePath.Count; i++)
            {
                string segPath = $"'TS_Files/{Path.GetFileName(filePath.Find(item => item.Contains($"seg-{i}")))}'";
                //Console.WriteLine(segPath);
                File.AppendAllText(processesPath + "/tsList.txt", "file " + segPath + "\n");
            }
            AddLog("TS List created");

        }



        void Download_MasterFile()
        {
            AddLog("Downloading master.m3u8...");
            string[] a = File.ReadAllLines(processesPath + "/video.html");
            foreach (var item in a)
            {
                if (item.Contains("/master.m3u8"))
                {
                    string masterURL = item.Split('"')[3];
                    webClient.DownloadFile(masterURL, $"{processesPath}/master.m3u8");
                    AddLog("master.m3u8 successfully downloaded");
                    return;
                }
            }
        }

        void Download_IndexFile(string indexURL)
        {
            AddLog("Downloading index-v1-a1.m3u8...");
            webClient.DownloadFile(new Uri(indexURL), $"{processesPath}/index-v1-a1.m3u8");
            AddLog("index-v1-a1.m3u8 successfully downloaded");
        }

        async Task Download_TsFiles(string indexURL, string destinationPath)
        {


            if (!Directory.Exists(destinationPath))
                Directory.CreateDirectory(destinationPath);

            string videoRawURL = indexURL.Replace("/index-v1-a1.m3u8", "");
            string[] a = File.ReadAllLines($"{processesPath}/index-v1-a1.m3u8");
            var b = File.ReadAllLines($"{processesPath}/index-v1-a1.m3u8").Where(item => item.StartsWith("seg") && item.EndsWith(".ts"));


            AddLog("Downloading TS Files...");
            string kok = richTextBox1.Text;

            int index = 0;
            foreach (var item in b)
            {
                AddLog($"Downloaded TS Files: {index}/{b.Count()}");
                string segURLs = $"{videoRawURL}/{item}";
                await webClient.DownloadFileTaskAsync(new Uri(segURLs), $"{destinationPath}/{item}");
                index++;
                richTextBox1.Text = kok;

            }

            AddLog($"Downloaded TS Files: {index}/{b.Count()}");
            AddLog("TS Files successfully downloaded");

        }

        void AddLog(string text)
        {
            this.Invoke((MethodInvoker)delegate
            {
                richTextBox1.AppendText(text + "\n");
            });

        }


        void DeleteFiles()
        {
            try
            {
                File.Delete($"{processesPath}/all.ts");
                File.Delete($"{processesPath}/index-v1-a1.m3u8");
                File.Delete($"{processesPath}/master.m3u8");
                File.Delete($"{processesPath}/tsList.txt");
                File.Delete($"{processesPath}/video.html");
                Directory.Delete($"{processesPath}/TS_Files", true);
            }
            catch { }
        }


        FileHandler.Test Get_TitleSeasonEpisode(string[] htmlFile)
        {//string output = input.Substring(input.IndexOf('.') + 1);
            string a = htmlFile[4].Substring(0, htmlFile[4].IndexOf(".AAC"));
            string b = a.Substring(a.IndexOf("Watch ")).Split(' ')[1];
            int AmountOfDots = b.Split('.').Length - 1;
            string TitleWithEpisodeAndSeason = b.Substring(0, b.LastIndexOf('.'));

            string SeasonAndEpisode = TitleWithEpisodeAndSeason.Substring(TitleWithEpisodeAndSeason.LastIndexOf('.') + 1);
            string Season = SeasonAndEpisode.Substring(1, SeasonAndEpisode.IndexOf("E") - 1);

            int EpisodeTextLength = SeasonAndEpisode.Length - Season.Length - 2;
            string Episode = SeasonAndEpisode.Substring(SeasonAndEpisode.IndexOf("E") + 1, EpisodeTextLength);

            string Title = TitleWithEpisodeAndSeason.Replace($".{SeasonAndEpisode}", "").Replace(".", " ");
            return new FileHandler.Test { Title = Title, Episode = Episode, Season = Season };

        }
        void GetContentInfo()
        {
            string[] htmlFile = File.ReadAllLines($"{processesPath}/video.html");
            var title = Get_TitleSeasonEpisode(htmlFile);
            Console.WriteLine(title.Season);
        }
        private async void button3_Click(object sender, EventArgs e)
        {
            //https://aniworld.to/anime/stream/kurokos-basketball/staffel-1/episode-1
            try
            {
                if (!textBox1.Text.Contains("https://aniworld.to/anime/stream/"))
                {
                    MessageBox.Show("Supported URL: https://aniworld.to/anime/stream/", "Unsupported URL", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    return;
                }

                richTextBox1.Clear();
                progressBar1.Value = 0;
                button3.Enabled = false;
                AddLog("Scrapping started");
                //Task CmdTask = Task.Run(() => RunCmd(textBox1.Text, scrapperPath + "/scrapper.exe", hidden: true));
                //await Task.WhenAll(CmdTask);
                await RunCmd(textBox1.Text, scrapperPath + "/scrapper.exe", hidden: true);
                AddLog("Scrapping successfully ended");
                progressBar1.Value = 10;

                string indexURL;
                Download_MasterFile();
                indexURL = File.ReadAllLines(processesPath + "/master.m3u8")[2];
                progressBar1.Value = 20;

                Download_IndexFile(indexURL);
                progressBar1.Value = 40;

                await Download_TsFiles(indexURL, $"{processesPath}/TS_Files");
                progressBar1.Value = 60;

                Create_TsList($"{processesPath}/TS_Files");
                progressBar1.Value = 80;

                await ConvertTsToMp4();

                progressBar1.Value = 100;
                DeleteFiles();
                MessageBox.Show("Media successfully downloaded", "Downloaded", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);

            }
            finally
            {
                button3.Enabled = true;
            }
        }

        private async void button1_Click_1(object sender, EventArgs e)
        {
            try
            {
                return;
                Console.WriteLine("Starting...");
                string indexURL = File.ReadAllLines(processesPath + "/master.m3u8")[2];

                await Download_TsFiles(indexURL, $"{processesPath}/TS_Files");
                Console.WriteLine("Download_TsFiles Done");
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);

            }
        }

        private void button2_Click(object sender, EventArgs e)
        {
            richTextBox1.Clear();

        }

        private void button4_Click(object sender, EventArgs e)
        {
            GetContentInfo();
        }
    }
}
