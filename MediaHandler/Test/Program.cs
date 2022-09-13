using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.DevTools;
using OpenQA.Selenium.Support.UI;


namespace Test
{
    internal class Program
    {
        static IWebDriver driver;
        static IDevToolsSession session;
        static INetwork interceptor;
        static string URL; //= "https://aniworld.to/anime/stream/kurokos-basketball/staffel-1/episode-1";//"https://anime-base.net/anime/kurokos-basketball";;
        static string VidozaButton = "//li[contains(@class,'col-md-3 col-xs-12 col-sm-6')][4]/div[@class='generateInlinePlayer'][1]/a[@class='watchEpisode'][1]/div[@class='hosterSiteVideoButton'][1]";
        static WebClient webClient = new WebClient();
        //C:\Coding\Projects\Private Streaming Service\Streamcal\MediaHandler\MediaHandler\bin\Debug\Proccesses/Test.exe ada
        static void Main(string[] args)
        {


            if (args.Length == 0)
                return;

            URL = args[0];

            ChromeOptions options = new ChromeOptions();
            //options.AddExtension(@"C:\Coding\Projects\Private Streaming Service\Streamcal\MediaHandler\MediaHandler\bin\Debug\Extensions\AdblockPLUS\3.14.2_0.crx");
            options.AddExtension(@"C:\Coding\Projects\Private Streaming Service\Streamcal\MediaHandler\MediaHandler\bin\Debug\Extensions\Popblocker\0.6.6_0.crx");
            options.AddArgument("--window-size=0,0");
            // options.AddArgument("--no-sandbox");
            //options.AddArgument("--headless");
            // options.AddArgument("--disable-gpu");
            //options.AddArgument("--disable-crash-reporter");
            //options.AddArgument("--disable-extensions");
            //options.AddArgument("--disable-in-process-stack-traces");
            options.AddArgument("--disable-logging");
            //options.AddArgument("--disable-dev-shm-usage");
            options.AddArgument("--log-level=3");
            options.AddArgument("--output=/dev/null");
            options.AddArgument("disable-infobars");
            options.AddArgument("--user-agent=Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5355d Safari/8536.25");
            driver = new ChromeDriver(options);
            // new WebDriverWait(driver, TimeSpan.FromSeconds(10));
            //driver.Manage().Window.Minimize();

            Console.Clear();
            //URL = Console.ReadLine();
            Console.WriteLine("Please wait...");
            Bla(URL);

            //while (true)
            //{

            //}
            Console.ReadKey();

        }

        private static void OnNetworkRequestSent(object sender, NetworkRequestSentEventArgs e)
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

        static bool alreadyMsg = false;

        private static void OnNetworkResponseReceived(object sender, NetworkResponseReceivedEventArgs e)
        {
            try
            {
                // Debug.WriteLine(e.ResponseUrl);
                /*if (e.ResponseUrl.Contains("https://www.google.com/recaptcha") && !alreadyMsg)
                {
                    //
                    webClient.DownloadFile("https://aniworld.to/anime/stream/kurokos-basketball/staffel-1/episode-1", $"{Directory.GetCurrentDirectory()}/vid2.html");
                    alreadyMsg = true;
                    Console.WriteLine("Please solve the reCaptcha");
                }*/
                if (e.ResponseUrl.Contains("voe.sx"))
                {
                    //https://delivery-node-hamid.voe-network.net/hls/,6oarncy6um33cszcr335fltuvigl4af3yqgl2z3t6aoorpjz4qfepiydchmq,.urlset/master.m3u8
                    //Console.WriteLine(e.ResponseUrl);
                    Console.WriteLine("Start downloading...");
                    Console.WriteLine($"{Directory.GetCurrentDirectory()}/video.html");
                    webClient.DownloadFile(e.ResponseUrl, $"{Directory.GetCurrentDirectory()}/video.html");
                    Console.WriteLine("Download done");
                    driver.Quit();
                    Environment.Exit(-1);
                    interceptor.StopMonitoring();

                    return;
                }
            }
            catch { }
        }

        //

        static void PressVidoza()
        {
            IWebElement dynamicElement = driver.FindElement(By.XPath(VidozaButton));
            dynamicElement.Click();
        }

        static void Bla(string URL)
        {
            interceptor = driver.Manage().Network;
            //interceptor.NetworkRequestSent += OnNetworkRequestSent;
            interceptor.NetworkResponseReceived += OnNetworkResponseReceived;
            Task task = new Task(async () =>
            {

                await interceptor.StartMonitoring();
                driver.Navigate().GoToUrl(URL);
                Console.WriteLine("Fetching data...");

                // driver.Url = URL;
                // PressVidoza();
            });
            task.Start();
        }
    }
}
