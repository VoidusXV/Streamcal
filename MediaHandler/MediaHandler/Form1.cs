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
using Newtonsoft.Json;
using Ookii.Dialogs.WinForms;

namespace MediaHandler
{

    public partial class Form1 : Form
    {

        static WebClient webClient = new WebClient();
        static string currentPath = Directory.GetCurrentDirectory();
        static string processesPath = currentPath + "/Processes";
        static string scrapperPath = currentPath + "/scrapper";
        static string settingsIni_Path = currentPath + "/settings.ini";
        static string NewContentJsonPath = processesPath + "/NewContent.json";
        static string serverDataPath;


        public static List<ScrapperProcess> CurrentProcesses = new List<ScrapperProcess>();
        public static List<BackgroundWorker> backgroundWorkers = new List<BackgroundWorker>();
        // ProcessForm processForm = new ProcessForm();

        public Form1()
        {
            InitializeComponent();
            Setup();
            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
        }

        void Setup()
        {
            if (File.Exists(settingsIni_Path))
                serverDataPath = File.ReadAllText(settingsIni_Path);

            textBox2.Text = serverDataPath;
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

        async Task ConvertTsToMp4(string fileName)
        {

            AddLog("Merging TS Files...");
            string Fixed_FileName = fileName.Replace(" ", "_");
            await RunCmd($"ffmpeg -f concat -i tsList.txt -c copy {Fixed_FileName}.ts", hidden: true, systemArguments: true);

            AddLog("TS Files successfully merged");
            AddLog("Converting TS To MP4...");

            await RunCmd($"ffmpeg -i {Fixed_FileName}.ts -acodec copy -vcodec copy {Fixed_FileName}.mp4", hidden: true, systemArguments: true);
            AddLog("TS To MP4 successfully converted");

        }

        async Task GeneratePreviewImagesAndThumbnail(string fileName)
        {
            //27s => 27/60 => 0.45
            //0.45/0.4 => (0.18 < 1) => 1
            string Fixed_FileName = fileName.Replace(" ", "_");

            int Scale = 80;
            int Columns = 10;
            double RandomConstant = 0.4;

            var Duration = GetContentDuration() / 1000; //JsonConvert.DeserializeObject<FileHandler.NewContent_Locations>(File.ReadAllText(NewContentJsonPath)).Duration / 1000; // In Seconds
            var DurationMinutes = Duration / 60;
            var SecondsPerImage = Math.Ceiling(DurationMinutes * RandomConstant);
            var ImageRows = Math.Ceiling(Duration / SecondsPerImage / Columns);

            Directory.CreateDirectory($"{processesPath}/img");
            AddLog("Generating Preview Images...");
            await RunCmd($"ffmpeg -i {Fixed_FileName}.mp4 -vf fps=1/10 -q:v 50 img/image_%d.jpg", hidden: true, systemArguments: true);// Every 10 seconds one image
            await RunCmd($"ffmpeg -i img/image_%d.jpg -filter_complex \"scale = {Scale}:-1, tile = {Columns}x{ImageRows}\" SeekSliderPreview.png", hidden: true, systemArguments: true); // Merge all images to one image
            AddLog("Preview Images Generated");

            AddLog("Generating Thumbnail...");
            int MiddleContentLength = Convert.ToInt32(Duration / 2);
            await RunCmd($"ffmpeg -ss {MiddleContentLength} -i {Fixed_FileName}.mp4 -qscale:v 1 -frames:v 1 Thumbnail.jpg", hidden: true, systemArguments: true);
            AddLog("Thumbnail Generated");

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
            string[] indexFileContent = File.ReadAllLines($"{processesPath}/index-v1-a1.m3u8");
            var segFiles = indexFileContent.Where(item => item.StartsWith("seg") && item.EndsWith(".ts"));


            AddLog("Downloading TS Files...");
            string kok = richTextBox1.Text;

            int index = 0;
            foreach (var item in segFiles)
            {
                AddLog($"Downloaded TS Files: {index}/{segFiles.Count()}");
                string segURLs = $"{videoRawURL}/{item}";
                await webClient.DownloadFileTaskAsync(new Uri(segURLs), $"{destinationPath}/{item}");
                index++;
                richTextBox1.Text = kok;

            }

            AddLog($"Downloaded TS Files: {index}/{segFiles.Count()}");
            AddLog("TS Files successfully downloaded");

        }

        double GetContentDuration()
        {
            string[] indexFileContent = File.ReadAllLines($"{processesPath}/index-v1-a1.m3u8");
            AddLog("Starting calculating Media Duration");
            var EXTINF_Files = indexFileContent.Where(item => item.StartsWith("#EXTINF:"));
            double duration = 0;

            // converting is kinda weird from ffmpeg so add 11.633 seconds
            double addTime = 11633;
            foreach (var item in EXTINF_Files)
            {
                duration += Convert.ToDouble(item.Replace("#EXTINF:", "").Replace(",", ""));
            }
            duration += addTime;
            //Console.WriteLine(duration);
            AddLog("Media Duration calculated");
            return duration;
        }

        void NewContent_AddDuration(string NewContent_JsonFile)
        {
            double duration = GetContentDuration();
            var NewContent_JsonObject = JsonConvert.DeserializeObject<FileHandler.NewContent_Locations>(NewContent_JsonFile);
            NewContent_JsonObject.Duration = Convert.ToInt64(duration);
            File.WriteAllText(NewContentJsonPath, JsonConvert.SerializeObject(NewContent_JsonObject, Formatting.Indented));
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
                var files = Directory.GetFiles(processesPath).Where(x => Path.GetFileName(x) != "ffmpeg.exe");
                foreach (var item in files)
                {
                    File.Delete(item);
                }

                string[] directories = Directory.GetDirectories(processesPath);
                foreach (var item in directories)
                    Directory.Delete(item, true);

            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "DeleteFiles", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }


        /* FileHandler.Series Get_TitleSeasonEpisode(string[] htmlFile)
         {//string output = input.Substring(input.IndexOf('.') + 1);
             string a = htmlFile[4].Substring(0, htmlFile[4].IndexOf(".AAC"));
             string b = a.Substring(a.IndexOf("Watch ")).Split(' ')[1];
             int AmountOfDots = b.Split('.').Length - 1;
             string TitleWithEpisodeAndSeason = b.Substring(0, b.LastIndexOf('.'));

             string SeasonAndEpisode = TitleWithEpisodeAndSeason.Substring(TitleWithEpisodeAndSeason.LastIndexOf('.') + 1);
             string Season = SeasonAndEpisode.Substring(1, SeasonAndEpisode.IndexOf("E") - 1);

             int EpisodeTextLength = SeasonAndEpisode.Length - Season.Length - 2;
             string EpisodeNum = SeasonAndEpisode.Substring(SeasonAndEpisode.IndexOf("E") + 1, EpisodeTextLength);

             string Title = TitleWithEpisodeAndSeason.Replace($".{SeasonAndEpisode}", "").Replace(".", " ");
             return new FileHandler.Series { Title = Title, EpisodeNum = EpisodeNum, Season = Season };

         }*/
        public void GetContentInfo()
        {
            //string[] htmlFile = File.ReadAllLines($"{processesPath}/video.html");
            //var title = Get_TitleSeasonEpisode(htmlFile);
            //Console.WriteLine(title.Season);
        }

        async Task ScrappingProcess()
        {
            try
            {
                AddLog("Scrapping started");
                await RunCmd(textBox1.Text, scrapperPath + "/scrapper.exe", hidden: false);
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


                string NewContent_Locations = File.ReadAllText(NewContentJsonPath);
                var NewContent_LocationsObject = JsonConvert.DeserializeObject<FileHandler.NewContent_Locations>(NewContent_Locations);
                string Media_FileName = $"{NewContent_LocationsObject.Title}_{NewContent_LocationsObject.Season}_{NewContent_LocationsObject.Episode}";

                AddLog($"Anime Data: {Media_FileName}");

                await ConvertTsToMp4($"{Media_FileName}");
                progressBar1.Value = 100;

                await GeneratePreviewImagesAndThumbnail(Media_FileName);

            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "ScrappingProcess Error");
            }

        }

        private async void button3_Click(object sender, EventArgs e)
        {
            try
            {
                if (!textBox1.Text.Contains("https://aniworld.to/anime/stream/"))
                {
                    MessageBox.Show("Supported URL: https://aniworld.to/anime/stream/", "Unsupported URL", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    return;
                }

                richTextBox1.Clear();
                progressBar1.Value = 0;
                //button3.Enabled = false;

                string ContentPath = $"{serverDataPath}/Content.json";
                string Content_JsonFile = File.ReadAllText(ContentPath);


                if (checkBox1.Checked)
                {

                    List<Task> TaskProcesses = new List<Task>();
                  
                    for (int i = 0; i <= numericUpDown2.Value - numericUpDown1.Value; i++)
                    {
                        string URL = textBox1.Text + (numericUpDown1.Value + i);
                        ScrapperProcess scrapperProcess = new ScrapperProcess(URL, serverDataPath, GetProcessIndex() + 1);
                        CurrentProcesses.Add(scrapperProcess);
                        TaskProcesses.Add(scrapperProcess.Start());
                    }
                    Console.WriteLine("CurrentProcesses:" + CurrentProcesses.Count);
                    await Task.WhenAll(TaskProcesses);
                }
                else
                {
                    ScrapperProcess scrapperProcess = new ScrapperProcess(textBox1.Text, serverDataPath, GetProcessIndex() + 1);
                    CurrentProcesses.Add(scrapperProcess);
                    await scrapperProcess.Start();
                }
                //await ScrappingProcess();
                //MoveFiles();
                //DeleteFiles();

                MessageBox.Show("Media successfully downloaded", "Downloaded", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Download Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
            finally
            {
                progressBar1.Value = 0;
                //button3.Enabled = true;
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


        void Move_ExistingContent(int index, FileHandler.NewContent_Locations NewContent_JsonObject, List<FileHandler.Data_Content> Content_JsonObject, bool NewContent = false)
        {
            try
            {
                int NewContentSeason = NewContent_JsonObject.Season;
                int ContentID = Content_JsonObject[index].ID;
                string LocationFile_Path = $"{serverDataPath}/{ContentID}/Locations.json";// $"{currentPath}/Locations.json";
                                                                                          // string LocationFile = File.ReadAllText($"{serverDataPath}/{ContentID}/Locations.json");
                                                                                          //var LocationObject = JsonConvert.DeserializeObject<FileHandler.Locations.Main>(LocationFile);

                int Episode = NewContent_JsonObject.Episode;
                string Path = $"/Series/Season_{NewContentSeason}/{Episode}/{NewContent_JsonObject.Episode}.mp4";
                string EpisodeTitle = NewContent_JsonObject.EpisodeTitle;
                string Description = NewContent_JsonObject.Episode_Description;
                long Duration = (long)GetContentDuration();// NewContent_JsonObject.Duration;

                string EpisodePath = $"{serverDataPath}/{ContentID}/Series/Season_{NewContentSeason}/{Episode}";
                string VideoFileName = $"{NewContent_JsonObject.Title}_{NewContent_JsonObject.Season}_{Episode}".Replace(" ", "_");
                if (!JsonHandler.SeasonExists(LocationFile_Path, NewContentSeason))
                    JsonHandler.Add_NewSeason(LocationFile_Path, NewContentSeason);

                JsonHandler.Add_NewEpisode(Episode, Path, EpisodeTitle, Description, Duration, NewContentSeason, LocationFile_Path);

                Console.WriteLine($"{serverDataPath}/{ContentID}/Series/Season_{NewContentSeason}/{Episode}");
                Console.WriteLine(NewContent);

                Directory.CreateDirectory($"{serverDataPath}/{ContentID}/Series/Season_{NewContentSeason}");
                Directory.CreateDirectory(EpisodePath);

                File.Move(processesPath + $"/{VideoFileName}.mp4", $"{serverDataPath}/{ContentID}/{Path}");
                File.Move(processesPath + $"/Thumbnail.jpg", $"{EpisodePath}/Thumbnail.jpg");
                File.Move(processesPath + $"/SeekSliderPreview.png", $"{EpisodePath}/SeekSliderPreview.png");

                if (NewContent)
                    webClient.DownloadFile(NewContent_JsonObject.CoverURL, $"{serverDataPath}/{ContentID}/Cover.jpg");
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Move_ExistingContent Error");
            }
        }

        void MoveFiles()
        {
            string NewContent_JsonFile = File.ReadAllText(NewContentJsonPath);
            var NewContent_JsonObject = JsonConvert.DeserializeObject<FileHandler.NewContent_Locations>(NewContent_JsonFile);

            string ContentPath = $"{serverDataPath}/Content.json";
            string Content_JsonFile = File.ReadAllText(ContentPath);
            List<FileHandler.Data_Content> Content_JsonObject = JsonConvert.DeserializeObject<List<FileHandler.Data_Content>>(Content_JsonFile);

            for (int i = 0; i < Content_JsonObject.Count; i++)
            {
                if (Content_JsonObject[i].Title == NewContent_JsonObject.Title)
                {
                    Console.WriteLine("Series Exists");
                    Move_ExistingContent(i, NewContent_JsonObject, Content_JsonObject);
                    return;
                }
            }

            FileHandler.NewContent NewContent = new FileHandler.NewContent
            {
                ID = Content_JsonObject.Count,
                Title = NewContent_JsonObject.Title,
                Description = NewContent_JsonObject.Description,
                Availability = "",
                Genre = ""
            };

            JsonHandler.Add_NewContent(ContentPath, Content_JsonFile, NewContent);
            Directory.CreateDirectory($"{serverDataPath}/{Content_JsonObject.Count}");
            Directory.CreateDirectory($"{serverDataPath}/{Content_JsonObject.Count}/Movie");
            Directory.CreateDirectory($"{serverDataPath}/{Content_JsonObject.Count}/Series");

            Content_JsonFile = File.ReadAllText(ContentPath);
            Content_JsonObject = JsonConvert.DeserializeObject<List<FileHandler.Data_Content>>(Content_JsonFile);
            Move_ExistingContent(Content_JsonObject.Count - 1, NewContent_JsonObject, Content_JsonObject, true);
        }

        private void button5_Click(object sender, EventArgs e)
        {
            MoveFiles();
        }

        private void linkLabel1_LinkClicked(object sender, LinkLabelLinkClickedEventArgs e)
        {
            MessageBox.Show("Select the 'Data' Folder in the 'Server' Folder", "Information", MessageBoxButtons.OK, MessageBoxIcon.Information);
        }

        private void button6_Click(object sender, EventArgs e)
        {

            VistaFolderBrowserDialog vistaFolderBrowserDialog = new VistaFolderBrowserDialog();
            vistaFolderBrowserDialog.SelectedPath = currentPath + "/";
            DialogResult dialogResult = vistaFolderBrowserDialog.ShowDialog();
            if (dialogResult != DialogResult.OK)
                return;
            if (Path.GetFileName(vistaFolderBrowserDialog.SelectedPath) != "Data")
            {
                MessageBox.Show("Please select the 'Data' Folder", "Wrong Folder", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }

            textBox2.Text = vistaFolderBrowserDialog.SelectedPath;
            File.WriteAllText($"{currentPath}/settings.ini", textBox2.Text);
        }

        private async void button7_Click(object sender, EventArgs e)
        {
            string NewContent_Locations = File.ReadAllText(NewContentJsonPath);
            var NewContent_LocationsObject = JsonConvert.DeserializeObject<FileHandler.NewContent_Locations>(NewContent_Locations);
            string Media_FileName = $"{NewContent_LocationsObject.Title}_{NewContent_LocationsObject.Season}_{NewContent_LocationsObject.Episode}".Replace(" ", "_");

            Console.WriteLine(Media_FileName);
            await GeneratePreviewImagesAndThumbnail(Media_FileName);
        }

        private void button8_Click(object sender, EventArgs e)
        {

        }

        private void button9_Click(object sender, EventArgs e)
        {
            string NewContent_JsonFile = File.ReadAllText(NewContentJsonPath);
            var NewContent_JsonObject = JsonConvert.DeserializeObject<FileHandler.NewContent_Locations>(NewContent_JsonFile);

            string LocationFile = File.ReadAllText(@"C:\Coding\Projects\Private Streaming Service\Streamcal\server\Data\0\Locations.json");
            var LocationObject = JsonConvert.DeserializeObject<FileHandler.Locations.Main>(LocationFile);

            FileHandler.Locations.Episodes NewEpisode = new FileHandler.Locations.Episodes
            {
                EpisodeNum = 5,
                Thumbnail = "Thumbnail.jpg",
                Path = "Path",
                Title = "Title",
                Description = "Description",
                Duration = 1337,
            };

            for (int i = 0; i < LocationObject.Series.Seasons[0].Episodes.Count; i++)
            {
                if (LocationObject.Series.Seasons[0].Episodes[i].EpisodeNum > NewContent_JsonObject.Episode)
                {
                    LocationObject.Series.Seasons[0].Episodes.Insert(i, NewEpisode);
                    break;
                }
            }

            //LocationObject.Series.Seasons.Add(NewSeason);
            var LocationObject_Formatted = JsonConvert.SerializeObject(LocationObject, Formatting.Indented);
            Console.WriteLine(LocationObject_Formatted);
        }

        private void button10_Click(object sender, EventArgs e)
        {
            DeleteFiles();
        }

        private async void button11_Click(object sender, EventArgs e)
        {
            string JsonFile = File.ReadAllText(NewContentJsonPath);
            var JsonObject = JsonConvert.DeserializeObject<FileHandler.NewContent_Locations>(JsonFile);

            AddLog($"Anime Data: {JsonObject.Title}_{JsonObject.Season}_{JsonObject.Episode}");
            await ConvertTsToMp4($"{JsonObject.Title}_{JsonObject.Season}_{JsonObject.Episode}");
        }

        private void button4_Click_1(object sender, EventArgs e)
        {
            APIKEY_Generator APIKEY_Generator = new APIKEY_Generator();
            APIKEY_Generator.Show();
        }

        private void button7_Click_1(object sender, EventArgs e)
        {
            //ScrapperProcess
            // ProcessForm processForm = new ProcessForm(CurrentProcesses);

            try
            {
                ProcessForm processForm = new ProcessForm(CurrentProcesses);
                processForm.Show();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }


        int GetProcessIndex()
        {
            var directories = Directory.GetDirectories(processesPath).Where(x => int.TryParse(Path.GetFileName(x), out int n));

            if (directories.Count() == 0)
                return -1;

            return Convert.ToInt32(Path.GetFileName(directories.Max<string>()));
        }

        private void button8_Click_1(object sender, EventArgs e)
        {
            ProcessForm processForm = new ProcessForm("Kopf\n23242424\n");
            processForm.Show();
        }

 
    }
}
