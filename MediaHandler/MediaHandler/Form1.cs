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
using MongoDB.Bson;
using MongoDB.Driver;

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

        string IP_Address = "192.168.2.121";
        int Port = 3005;
        MongoClient mongoClient = null;
        MongoClientSettings mongoClientSettings = null;
        public Form1()
        {
            InitializeComponent();
            Setup();
            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;

        }
        private void Form1_Load(object sender, EventArgs e)
        {
            try
            {
                // mongoClientSettings = MongoClientSettings.FromConnectionString($"mongodb://localhost:{Port}");

                mongoClient = new MongoClient($"mongodb://localhost:{Port}");

                label6.Text = "Connected";
                label6.ForeColor = Color.Green;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                label6.Text = "Not Connected";
                label6.ForeColor = Color.FromArgb(255, 192, 0, 0);
            }
        }
        void Setup()
        {
            if (File.Exists(settingsIni_Path))
                serverDataPath = File.ReadAllText(settingsIni_Path);

            textBox2.Text = serverDataPath;

        }
        private void button1_Click(object sender, EventArgs e)
        {


        }


        private void Form1_FormClosing(object sender, FormClosingEventArgs e)
        {
            Application.Exit();
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
            }
        }

        private void button1_Click_1(object sender, EventArgs e)
        {
            try
            {

            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);

            }
        }

        private void button2_Click(object sender, EventArgs e)
        {

        }

        private void button4_Click(object sender, EventArgs e)
        {

        }

        List<Task> randomTasks = new List<Task>();
        bool isCanceled = false;


        Task Cancelation(int Sleeptimer = 1000, Action action = null)
        {
            Task a = new Task(() =>
            {
                try
                {
                    while (true)
                    {

                        if (isCanceled && action != null)
                            action();
                        // throw new Exception("Task canceled");

                        Console.WriteLine("check");
                        Thread.Sleep(Sleeptimer);

                    }
                }
                catch (Exception ex)
                {
                    if (ex.Message == "Task canceled")
                        Console.WriteLine("Task canceled");
                }
            });

            return a;
        }



        private void button5_Click(object sender, EventArgs e)
        {


            randomTasks.Add(new Task(() =>
            {


                Task cancelTask = Cancelation(action: () => { throw new Exception("Task canceled"); });
                cancelTask.Start();
                for (int i = 0; i < 100; i++)
                {
                    //Console.WriteLine("randomTask:" + i);
                    //Console.WriteLine("isCanceled:" + isCanceled);
                    Thread.Sleep(1000);
                }

            }));

            randomTasks[0].Start();
        }


        private void button10_Click(object sender, EventArgs e)
        {

            //randomTask2.Abort();
            isCanceled = true;
            //Console.WriteLine("Task canceled?");
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

        }

        private void button8_Click(object sender, EventArgs e)
        {

        }

        private void button9_Click(object sender, EventArgs e)
        {
            string NewContent_JsonFile = File.ReadAllText(NewContentJsonPath);
            var NewContent_JsonObject = JsonConvert.DeserializeObject<FileHandler.ScrapperContent>(NewContent_JsonFile);

            string LocationFile = File.ReadAllText(@"C:\Coding\Projects\Private Streaming Service\Streamcal\server\Data\0\Locations.json");
            var LocationObject = JsonConvert.DeserializeObject<FileHandler.Locations.Main>(LocationFile);

            FileHandler.Locations.Episode NewEpisode = new FileHandler.Locations.Episode
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


        private async void button11_Click(object sender, EventArgs e)
        {

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

        private void button9_Click_1(object sender, EventArgs e)
        {
            var database = mongoClient.GetDatabase("Streamcal");

            var ContentProjection = Builders<FileHandler.NewContent>.Projection.Exclude(u => u.MongoDB_ID);
            List<FileHandler.NewContent> ContentData = MongoDB_Handler.FetchCollection(database, "Content", ContentProjection);


            IMongoCollection<FileHandler.Locations.Main> LocationsCollection = database.GetCollection<FileHandler.Locations.Main>("Locations");
            var LocationsProjection = Builders<FileHandler.Locations.Main>.Projection.Exclude(u => u.MongoDB_ID);//.Include(u => u.Series).Include(u => u.Movies);
            var LocationsData = LocationsCollection.Find(x => true).Project<FileHandler.Locations.Main>(LocationsProjection).ToList();





            FileHandler.NewContent NewContentOutput = null;
            bool IsSeriesExists = MongoDB_Handler.SeriesExists(ContentData, "Kurokos Basketball", ref NewContentOutput);

            Console.WriteLine($"IsSeriesExists: {IsSeriesExists}");
            if (!IsSeriesExists)
                return;

            FileHandler.Locations.Season SeasonOutput = null;
            bool IsSeasonExists = MongoDB_Handler.SeasonExists(LocationsData[NewContentOutput.ID].Series, 1, ref SeasonOutput);

            Console.WriteLine($"IsSeasonExists: {IsSeasonExists}");
            if (!IsSeasonExists)
                return;

            FileHandler.Locations.Episode EpisodeOutput = null;
            bool IsEpisodeExists = MongoDB_Handler.EpisodeExists(SeasonOutput, "Ich meine es ernst", ref EpisodeOutput);

            Console.WriteLine($"IsEpisodeExists: {IsEpisodeExists} {EpisodeOutput.ToBsonDocument()}");

            //FileHandler.NewContent CheckingContent = new FileHandler.NewContent();
            //if (MongoDB_Handler.SeriesExists(ContentData, "Kurokos Basketball", ref CheckingContent))
            //{

            //}



            return;

            //Kurokos Basketball

            //foreach (var item in FindContent)
            {
                //Console.WriteLine(item.ToBsonDocument());
            }

            //foreach (var item in LocationsData)
            //{
            //    Console.WriteLine(item.ToBsonDocument());
            //}
        }
    }
}
