using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.DevTools;
//using DevToolsSessionDomains = OpenQA.Selenium.DevTools.V85.DevToolsSessionDomains;
//using Network = OpenQA.Selenium.DevTools.V85.Network;

namespace MediaHandler
{
    public partial class Form1 : Form
    {
        protected IWebDriver driver;
        protected IDevToolsSession session;
        string URL = "https://aniworld.to/anime/stream/kurokos-basketball/staffel-1/episode-1";
        public Form1()
        {
            InitializeComponent();
            driver = new ChromeDriver();
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


            string tag = "//li[@class='col-md-3 col-xs-12 col-sm-6 episodeLink29925'][1]/div[@class='generateInlinePlayer'][1]/a[@class='watchEpisode'][1]/div[@class='hosterSiteVideoButton'][1]";
            IWebElement dynamicElement = driver.FindElement(By.XPath(tag));
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
        public async Task LogNetworkRequests(IWebDriver driver)
        {
            Console.WriteLine("Testussss");

            INetwork interceptor = driver.Manage().Network;
            interceptor.NetworkRequestSent += OnNetworkRequestSent;
            interceptor.NetworkResponseReceived += OnNetworkResponseReceived;
            await interceptor.StartMonitoring();
            // driver.Url = URL;
            //await interceptor.StopMonitoring();
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

        private void OnNetworkResponseReceived(object sender, NetworkResponseReceivedEventArgs e)
        {
            StringBuilder builder = new StringBuilder();
            builder.AppendFormat("Response {0}", e.RequestId).AppendLine();
            builder.AppendLine("--------------------------------");
            builder.AppendFormat("{0} {1}", e.ResponseStatusCode, e.ResponseUrl).AppendLine();
            foreach (KeyValuePair<string, string> header in e.ResponseHeaders)
            {
                builder.AppendFormat("{0}: {1}", header.Key, header.Value).AppendLine();
            }

            if (e.ResponseResourceType == "Document")
            {
                builder.AppendLine(e.ResponseBody);
            }
            else if (e.ResponseResourceType == "Script")
            {
                builder.AppendLine("<JavaScript content>");
            }
            else if (e.ResponseResourceType == "Stylesheet")
            {
                builder.AppendLine("<stylesheet content>");
            }
            else if (e.ResponseResourceType == "Image")
            {
                builder.AppendLine("<image>");
            }
            else
            {
                builder.AppendFormat("Content type: {0}", e.ResponseResourceType).AppendLine();
            }

            builder.AppendLine("--------------------------------");
            Console.WriteLine(builder.ToString());
        }

        private async void button3_Click(object sender, EventArgs e)
        {
            try
            {
                INetwork interceptor = driver.Manage().Network;
                driver.Url = URL;

                interceptor.NetworkRequestSent += OnNetworkRequestSent;
                interceptor.NetworkResponseReceived += OnNetworkResponseReceived;
                Task task = new Task(async () =>
                {
                    await interceptor.StartMonitoring();
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


        }
    }
}
