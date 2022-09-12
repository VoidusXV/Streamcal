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
namespace Test
{
    internal class Program
    {
        static IWebDriver driver;
        static IDevToolsSession session;
        static INetwork interceptor;
        static string URL = "https://aniworld.to/anime/stream/kurokos-basketball/staffel-1/episode-1";//"https://anime-base.net/anime/kurokos-basketball";;
        static string VidozaButton = "//li[contains(@class,'col-md-3 col-xs-12 col-sm-6')][4]/div[@class='generateInlinePlayer'][1]/a[@class='watchEpisode'][1]/div[@class='hosterSiteVideoButton'][1]";
        static WebClient webClient = new WebClient();


        static void Main(string[] args)
        {
            //Console.WriteLine("Hello World!");

            ChromeOptions options = new ChromeOptions();
            //options.AddExtension(@"C:\Coding\Projects\Private Streaming Service\Streamcal\MediaHandler\MediaHandler\bin\Debug\Extensions\AdblockPLUS\3.14.2_0.crx");
            options.AddExtension(@"C:\Coding\Projects\Private Streaming Service\Streamcal\MediaHandler\MediaHandler\bin\Debug\Extensions\Popblocker\0.6.6_0.crx");
            //options.AddArgument("--window-size=0,0");
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


            driver = new ChromeDriver(options);
            driver.Manage().Window.Minimize();

            Console.Clear();
            Console.WriteLine("Please wait...");
            Bla();

            /*  while (true)
              {
                  string a = Console.ReadLine();
                  if (a == "press")
                  {
                      driver.Url = URL;

                      //IWebElement dynamicElement = driver.FindElement(By.XPath(VidozaButton));
                      //dynamicElement.Click();
                  }
                  if (a == "start")
                      Bla();

              }*/
            while (true)
            {

            }
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

        private static void OnNetworkResponseReceived(object sender, NetworkResponseReceivedEventArgs e)
        {

            try
            {
                if (e.ResponseUrl.Contains("voe.sx"))
                {
                    Console.WriteLine(e.ResponseUrl);
                    Console.WriteLine("Start downloading...");
                    webClient.DownloadFile(e.ResponseUrl, $"{Directory.GetCurrentDirectory()}/vid.html");
                    Console.WriteLine("Download done");
                    driver.Quit();
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
        static void Bla()
        {
            interceptor = driver.Manage().Network;
            //interceptor.NetworkRequestSent += OnNetworkRequestSent;
            interceptor.NetworkResponseReceived += OnNetworkResponseReceived;
            Task task = new Task(async () =>
            {
                await interceptor.StartMonitoring();
                driver.Url = URL;
                // PressVidoza();
            });
            task.Start();
        }
    }
}
