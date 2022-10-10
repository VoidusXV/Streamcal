using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace MediaHandler
{
    class ScrapperProcess
    {
        WebClient webClient = new WebClient();
        static string currentPath = Directory.GetCurrentDirectory();
        static string processesPath = currentPath + "/Processes/0";
        string scrapperPath = currentPath + "/scrapper";
        string NewContentJsonPath = processesPath + "/NewContent.json";
        string serverDataPath;
        string ffmpegPath = "..\\ffmpeg.exe";


        string URL;
        public ScrapperProcess(string URL, string serverDataPath)
        {
            this.URL = URL;
            this.serverDataPath = serverDataPath;
        }

        public async Task Start()
        {

            // Console.WriteLine(File.Exists(NewContentJsonPath));
            //return;
            if (!Directory.Exists(processesPath))
                Directory.CreateDirectory(processesPath);

            await ScrappingProcess(URL);
            MoveFiles();
            DeleteFiles();
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

        }
        async Task ScrappingProcess(string URL)
        {
            try
            {


                AddLog("Scrapping started");
                await RunCmd(URL, scrapperPath + "/scrapper.exe", hidden: false);
                AddLog("Scrapping successfully ended");
                //progressBar1.Value = 10;

                string indexURL;
                Download_MasterFile();
                indexURL = File.ReadAllLines(processesPath + "/master.m3u8")[2];
                // progressBar1.Value = 20;

                Download_IndexFile(indexURL);
                //progressBar1.Value = 40;

                await Download_TsFiles(indexURL, $"{processesPath}/TS_Files");
                // progressBar1.Value = 60;

                Create_TsList($"{processesPath}/TS_Files");
                //progressBar1.Value = 80;


                string NewContent_Locations = File.ReadAllText(NewContentJsonPath);
                var NewContent_LocationsObject = JsonConvert.DeserializeObject<FileHandler.NewContent_Locations>(NewContent_Locations);
                string Media_FileName = $"{NewContent_LocationsObject.Title}_{NewContent_LocationsObject.Season}_{NewContent_LocationsObject.Episode}";

                AddLog($"Anime Data: {Media_FileName}");

                await ConvertTsToMp4($"{Media_FileName}");
                // progressBar1.Value = 100;

                await GeneratePreviewImagesAndThumbnail(Media_FileName);

            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "ScrappingProcess Error");
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
            AddLog("Media Duration calculated");
            return duration;
        }

        void DeleteFiles()
        {
            try
            {
                Directory.Delete(processesPath, true);
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "DeleteFiles", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
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

        void Download_IndexFile(string indexURL)
        {
            AddLog("Downloading index-v1-a1.m3u8...");
            webClient.DownloadFile(new Uri(indexURL), $"{processesPath}/index-v1-a1.m3u8");
            AddLog("index-v1-a1.m3u8 successfully downloaded");
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


        async Task Download_TsFiles(string indexURL, string destinationPath)
        {


            if (!Directory.Exists(destinationPath))
                Directory.CreateDirectory(destinationPath);

            string videoRawURL = indexURL.Replace("/index-v1-a1.m3u8", "");
            string[] indexFileContent = File.ReadAllLines($"{processesPath}/index-v1-a1.m3u8");
            var segFiles = indexFileContent.Where(item => item.StartsWith("seg") && item.EndsWith(".ts"));


            AddLog("Downloading TS Files...");
            //string kok = richTextBox1.Text;

            int index = 0;
            foreach (var item in segFiles)
            {
                //AddLog($"Downloaded TS Files: {index}/{segFiles.Count()}");
                string segURLs = $"{videoRawURL}/{item}";
                await webClient.DownloadFileTaskAsync(new Uri(segURLs), $"{destinationPath}/{item}");
                index++;
                //richTextBox1.Text = kok;

            }

            AddLog($"Downloaded TS Files: {index}/{segFiles.Count()}");
            AddLog("TS Files successfully downloaded");

        }

        async Task ConvertTsToMp4(string fileName)
        {

            AddLog("Merging TS Files...");
            string Fixed_FileName = fileName.Replace(" ", "_");
            await RunCmd($"{ffmpegPath} -f concat -i tsList.txt -c copy {Fixed_FileName}.ts", hidden: true, systemArguments: true);

            AddLog("TS Files successfully merged");
            AddLog("Converting TS To MP4...");

            await RunCmd($"{ffmpegPath} -i {Fixed_FileName}.ts -acodec copy -vcodec copy {Fixed_FileName}.mp4", hidden: true, systemArguments: true);
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
            await RunCmd($"{ffmpegPath} -i {Fixed_FileName}.mp4 -vf fps=1/10 -q:v 50 img/image_%d.jpg", hidden: true, systemArguments: true);// Every 10 seconds one image
            await RunCmd($"{ffmpegPath} -i img/image_%d.jpg -filter_complex \"scale = {Scale}:-1, tile = {Columns}x{ImageRows}\" SeekSliderPreview.png", hidden: true, systemArguments: true); // Merge all images to one image
            AddLog("Preview Images Generated");

            AddLog("Generating Thumbnail...");
            int MiddleContentLength = Convert.ToInt32(Duration / 2);
            await RunCmd($"{ffmpegPath} -ss {MiddleContentLength} -i {Fixed_FileName}.mp4 -qscale:v 1 -frames:v 1 Thumbnail.jpg", hidden: true, systemArguments: true);
            AddLog("Thumbnail Generated");

        }


        void AddLog(string text)
        {
            Console.WriteLine(text);
        }
    }
}
