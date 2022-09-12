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
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.DevTools;
using System.Net;
using System.Diagnostics;


namespace MediaHandler
{
    public partial class Form1 : Form
    {
        protected IWebDriver driver;
        protected IDevToolsSession session;
        static INetwork interceptor;
        static WebClient webClient = new WebClient();


        string URL = "https://aniworld.to/anime/stream/kurokos-basketball/staffel-1/episode-1";//"https://anime-base.net/anime/kurokos-basketball";;

        static string currentPath = Directory.GetCurrentDirectory();
        static string proccessesPath = currentPath + "/Proccesses";

        public Form1()
        {
            InitializeComponent();
            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
        }

        private void button5_Click(object sender, EventArgs e)
        {
            ChromeOptions options = new ChromeOptions();
            // options.AddExtension(currentPath + "/Extensions/AdblockPLUS/3.14.2_0.crx");
            options.AddExtension(currentPath + "/Extensions/Popblocker/0.6.6_0.crx");
            driver = new ChromeDriver(options);
        }

        private void button1_Click(object sender, EventArgs e)
        {
            driver.Navigate().GoToUrl(URL);


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

        private void button2_Click(object sender, EventArgs e)
        {


            // string tag = "//li[@class='col-md-3 col-xs-12 col-sm-6 episodeLink29925'][1]/div[@class='generateInlinePlayer'][1]/a[@class='watchEpisode'][1]/div[@class='hosterSiteVideoButton'][1]";
            string VidozaButton = "//li[contains(@class,'col-md-3 col-xs-12 col-sm-6')][4]/div[@class='generateInlinePlayer'][1]/a[@class='watchEpisode'][1]/div[@class='hosterSiteVideoButton'][1]";

            IWebElement dynamicElement = driver.FindElement(By.XPath(VidozaButton));
            dynamicElement.Click();

            //var chromeDevTool = driver.GetDevToolsSession();
            // Console.WriteLine("Result: " + dynamicElement.Text);
        }

        private void Form1_FormClosing(object sender, FormClosingEventArgs e)
        {
            if (driver != null)
                driver.Quit();

            Application.Exit();
        }


        private void OnNetworkRequestSent(object sender, NetworkRequestSentEventArgs e)
        {
            StringBuilder builder = new StringBuilder();
            builder.AppendFormat("Request {0}", e.RequestId).AppendLine();
            builder.AppendLine("--------------------------------");
            builder.AppendFormat("{0} {1}", e.RequestMethod, e.RequestUrl).AppendLine();
            foreach (KeyValuePair<string, string> header in e.RequestHeaders)
            {
                builder.AppendFormat("{0}: {1}", header.Key, header.Value).AppendLine();
            }
            builder.AppendLine("--------------------------------");
            builder.AppendLine();
            Console.WriteLine(builder.ToString());
        }

        private static void OnNetworkResponseReceived(object sender, NetworkResponseReceivedEventArgs e)
        {

            try
            {
                if (e.ResponseUrl.Contains("voe.sx"))
                {
                    // webClient.DownloadFile(e.ResponseUrl, $"{proccessesPath}/vid.html");
                    Console.WriteLine(e.ResponseUrl);
                    interceptor.StopMonitoring();
                    Console.WriteLine("Stopped");
                }
            }
            catch { }
        }

        private async void button3_Click(object sender, EventArgs e)
        {
            try
            {
                INetwork interceptor = driver.Manage().Network;

                //interceptor.NetworkRequestSent += OnNetworkRequestSent;
                interceptor.NetworkResponseReceived += OnNetworkResponseReceived;
                Task task = new Task(async () =>
                {
                    await interceptor.StartMonitoring();
                    driver.Url = URL;

                    //string tag = "//li[@class='col-md-3 col-xs-12 col-sm-6 episodeLink29925'][1]/div[@class='generateInlinePlayer'][1]/a[@class='watchEpisode'][1]/div[@class='hosterSiteVideoButton'][1]";
                    //IWebElement dynamicElement = driver.FindElement(By.XPath(tag));
                    //dynamicElement.Click();
                });
                task.Start();
            }
            catch (Exception ex) { Console.WriteLine(ex.ToString()); }
        }



        private void button4_Click(object sender, EventArgs e)
        {
            //string streamtape_button = "//li[@class='col-md-3 col-xs-12 col-sm-6 episodeLink29925'][1]/div[@class='generateInlinePlayer'][1]/a[@class='watchEpisode'][1]/div[@class='hosterSiteVideoButton'][1]";
            string animeDetails = "//p[@class='seri_des']";
            string regisseure = "//li[@class='seriesDirector'][1]//span";
            string produzent = "//li[@itemprop='creator'][1]//span";
            string title = "//span[@class='episodeGermanTitle']";
            string description = "//p[@itemprop='description']";


            IWebElement animeDetailsElement = driver.FindElement(By.XPath(animeDetails));
            IWebElement regisseureElement = driver.FindElement(By.XPath(regisseure));
            IWebElement produzentElement = driver.FindElement(By.XPath(produzent));
            IWebElement titleElement = driver.FindElement(By.XPath(title));
            IWebElement descriptionElement = driver.FindElement(By.XPath(description));

            Console.WriteLine(animeDetailsElement.Text);
            Console.WriteLine(regisseureElement.Text);
            Console.WriteLine(produzentElement.Text);
            Console.WriteLine(titleElement.Text);
            Console.WriteLine(descriptionElement.Text);

            //ffmpeg -f concat -i mylist.txt -c copy all.ts

        }

        private void button6_Click(object sender, EventArgs e)
        {
            //string streamtape_redirect = "//li[@class='col-md-3 col-xs-12 col-sm-6 episodeLink368154'][1]/div[@class='generateInlinePlayer'][1]/a[@class='watchEpisode'][1]/@href";
            //IWebElement streamtape_redirectElement = driver.FindElement(By.XPath(streamtape_redirect));

            try
            {
                // IWebElement blaElement = driver.FindElement(By.("player_html5_api"));
                // Console.WriteLine(driver.WindowHandles);
                //Console.WriteLine(blaElement.Text);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }

        void RunCmd(string Arguments)
        {
            Process process = new Process();
            ProcessStartInfo startInfo = new ProcessStartInfo();
            startInfo.WindowStyle = ProcessWindowStyle.Hidden;
            startInfo.WorkingDirectory = proccessesPath;
            startInfo.FileName = "cmd.exe";
            startInfo.Arguments = $"/c {Arguments}";
            process.StartInfo = startInfo;
            process.Start();
            process.WaitForExit();
        }

        void ConvertTsToMp4()
        {
            RunCmd("ffmpeg -f concat -i tsList.txt -c copy all.ts");
            Console.WriteLine("Done");
           //RunCmd("ffmpeg -i all.ts -acodec copy -vcodec copy all.mp4");
        }

        static void Create_TsList(string path)
        {
            List<string> filePath = Directory.GetFiles(path).ToList();
            //Console.WriteLine("KOK:" + filePath.Find(item => item.Contains("seg-2")));
            //                    File.AppendAllText(proccessesPath + "/tsList.txt", Path.GetFileName(item) + "\n");

            File.Delete(proccessesPath + "/tsList.txt");
            for (int i = 1; i <= filePath.Count; i++)
            {
                string segPath = $"'TS_Files/{Path.GetFileName(filePath.Find(item => item.Contains($"seg-{i}")))}'";
                //Console.WriteLine(segPath);
                File.AppendAllText(proccessesPath + "/tsList.txt", "file " + segPath + "\n");
            }
        }
        private void button7_Click(object sender, EventArgs e)
        {
            Create_TsList($"{proccessesPath}/TS_Files");
        }

        string TrimStringByStartAndEnd(string start, string end)
        {
            string a = "https://delivery229.akamai-cdn-content.com/hls2/01/05311/9zcy4hj72gwx_n/seg-1-v1-a1.ts?t=dOcPcYDPmAz1LXeySXK9JB6EQdzcWz2aqAq2xF1ty-w&s=1662993615&e=10800&f=26557968&srv=sto009&client=121.49.114.159";

            foreach (var item in a)
            {
                Console.WriteLine(item);
            }
            return "";
        }

        private void button8_Click(object sender, EventArgs e)
        {//2IzN8JWzH32l_3PCAOubBfLsucWuLBFRMiLZ_pxrLvI

            WebClient webClient = new WebClient();
            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
            string url = "https://delivery330.akamai-cdn-content.com/hls2/01/05311/9zcy4hj72gwx_o/seg-123-v1-a1.ts?t=2IzN8JWzH32l_3PCAOubBfLsucWuLBFRMiLZ_pxrLvI&s=1662989965&e=10800&f=26557968&srv=sto009&client=121.49.114.159";
            webClient.DownloadFile(url, $"{proccessesPath}/{0}.ts");
            return;
            string[] a = File.ReadAllLines(proccessesPath + "/index-v1-a1.m3u8");
            int index = 0;
            foreach (var item in a)
            {
                if (item.StartsWith("https://"))
                {
                    Console.WriteLine(item);
                    webClient.DownloadFile(item, $"{proccessesPath}/{index}.ts");
                    index++;
                }
            }
        }

        private void button9_Click(object sender, EventArgs e)
        {
            WebClient webClient = new WebClient();
            //https://voe.sx/e/t2r54qqis45d
            //https://vidoza.net/embed-2milixpt1qm0.html
            // webClient.DownloadFile("https://voe.sx/e/t2r54qqis45d", $"{proccessesPath}/vid.html");
            return;
            string[] a = File.ReadAllLines(proccessesPath + "/vid.html");
            foreach (var item in a)
            {
                if (item.Contains("/v.mp4"))
                {
                    Console.WriteLine(item.Split('"')[1]);
                    var kok = webClient.DownloadData(item.Split('"')[1]);
                    MessageBox.Show("Done");
                    //webClient.DownloadFile(item.Split('"')[1], $"{proccessesPath}/0.mp4");
                    return;
                }
            }
        }


        void Download_MasterFile()
        {
            string[] a = File.ReadAllLines(proccessesPath + "/vid.html");
            foreach (var item in a)
            {
                if (item.Contains("/master.m3u8"))
                {
                    string masterURL = item.Split('"')[3];
                    webClient.DownloadFile(masterURL, $"{proccessesPath}/master.m3u8");
                    return;
                }
            }
        }
        private void button10_Click(object sender, EventArgs e)
        {
            //Download_MasterFile();
            string indexURL = File.ReadAllLines(proccessesPath + "/master.m3u8")[2];
            string videoRawURL = indexURL.Replace("/index-v1-a1.m3u8", "");
            //Console.WriteLine(videoRawURL);
            // webClient.DownloadFile(indexURL, $"{proccessesPath}/index.m3u8");

            string[] a = File.ReadAllLines($"{proccessesPath}/index.m3u8");
            foreach (var item in a)
            {
                if (item.StartsWith("seg") && item.EndsWith(".ts"))
                {
                    string segURLs = $"{videoRawURL}/{item}";
                    webClient.DownloadFile(segURLs, $"{proccessesPath}/TS_Files/{item}");

                    //Console.WriteLine($"{videoRawURL}/{item}");
                }
            }
        }

        private void button11_Click(object sender, EventArgs e)
        {
            ConvertTsToMp4();
        }
    }
}
