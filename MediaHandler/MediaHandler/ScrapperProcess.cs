using MongoDB.Driver;
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
using System.Threading;

namespace MediaHandler
{
    public delegate void Event(string text = "");

    public class ScrapperProcess
    {
        public event Event LogAdded;
        public event Event onFinished;

        WebClient webClient = new WebClient();
        static string currentPath = Directory.GetCurrentDirectory();
        string processesPath;// = currentPath + $"/Processes/{ProcessIndex}";
        string scrapperPath;// = currentPath + "/scrapper";
        string NewContentJsonPath;// = processesPath + "/NewContent.json";
        string serverDataPath;
        string ffmpegPath = "..\\ffmpeg.exe";
        double DurationMiliseconds = 0;

        public string Logs = "";
        public string URL = "";
        public int Index = 0;

        bool isSeriesExisting;
        bool isSeasonExisting;
        bool isEpisodeExisting;
        IMongoDatabase database;

        FileHandler.NewContent NewContentOutput = null;
        FileHandler.Locations.Season SeasonOutput = null;
        FileHandler.Locations.Episode EpisodeOutput = null;
        public System.Threading.Thread ProcessThread = null;

        public ScrapperProcess(string URL, string serverDataPath, int ProcessIndex, IMongoDatabase database)
        {
            this.URL = URL;
            this.serverDataPath = serverDataPath;
            Console.WriteLine("ProcessIndex:" + ProcessIndex);
            processesPath = currentPath + $"/Processes/{ProcessIndex}";
            scrapperPath = currentPath + "/scrapper";
            NewContentJsonPath = processesPath + "/NewContent.json";
            this.database = database;

        }

        public async Task Start()
        {

            try
            {
                // Console.WriteLine(File.Exists(NewContentJsonPath));
                //return;
                if (!Directory.Exists(processesPath))
                    Directory.CreateDirectory(processesPath);


                //Unknown Error 

                IMongoCollection<FileHandler.Locations.Main> LocationsCollection = database.GetCollection<FileHandler.Locations.Main>("Locations");
                List<FileHandler.Locations.Main> LocationsData = LocationsCollection.Find(x => true).ToList();
                List<FileHandler.NewContent> ContentData = MongoDB_Handler.FetchCollection(database, "Content");

                await RunCmd(URL, scrapperPath + "/scrapper.exe", hidden: false);
                if (!File.Exists(NewContentJsonPath))
                    return;

                string NewContent_Locations = File.ReadAllText(NewContentJsonPath);
                FileHandler.ScrapperContent NewContent_JsonObject = JsonConvert.DeserializeObject<FileHandler.ScrapperContent>(NewContent_Locations);

                DataExistingCheck(LocationsData, ContentData, NewContent_JsonObject); //TODO: Change To an Async Func

                if (isEpisodeExisting)   //TODO: Wanna replace Episode? Question MsgBox
                    throw new Exception("Episode Already exists");



                await ScrappingDownloadProcess(URL, NewContent_JsonObject);
                AddDataToMongoDB(NewContent_JsonObject, LocationsCollection, LocationsData); //TODO: Change To an Async Func
                MoveMediaFile(LocationsData, NewContent_JsonObject);
                DeleteFiles();
                onFinished();
                DeleteFiles();

            }
            catch (Exception ex)
            {
                if (ex.Message == "Episode Already exists")
                    MessageBox.Show("Episode Already exists", "Error", MessageBoxButtons.OK, MessageBoxIcon.Information);
                else
                    Console.WriteLine("ScrapperProcessStart Error:" + ex.Message);
            }
            finally
            {
                //DeleteFiles();
            }
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

        async Task ScrappingDownloadProcess(string URL, FileHandler.ScrapperContent NewContent_LocationsObject)
        {
            //try
            {
                string Media_FileName = $"{NewContent_LocationsObject.Title}_{NewContent_LocationsObject.SeasonNum}_{NewContent_LocationsObject.EpisodeNum}";
                #region Old
                /* string indexURL;
                 Download_MasterFile();
                 indexURL = File.ReadAllLines(processesPath + "/master.m3u8")[2];

                 Download_IndexFile(indexURL);

                 await Download_TsFiles(indexURL, $"{processesPath}/TS_Files");

                 Create_TsList($"{processesPath}/TS_Files");

                 AddLog($"Anime Data: {Media_FileName}");
                 await ConvertTsToMp4($"{Media_FileName}");
                */
                #endregion

                await Download_RawVideo(Media_FileName); // Internet connection too Slow
                DurationMiliseconds = await GetContentDurationNEW(Media_FileName);

                await GeneratePreviewImagesAndThumbnail(Media_FileName, DurationMiliseconds);
                AddLog("ScrappingProcess Done");

            }
            //catch (Exception ex)
            {
                //  MessageBox.Show(ex.Message, "ScrappingProcess Error");
            }

        }


        void DataExistingCheck(List<FileHandler.Locations.Main> LocationsData, List<FileHandler.NewContent> ContentData, FileHandler.ScrapperContent NewContent_LocationsObject)
        {
            try
            {
                AddLog("Starting DataExistingCheck");

                isSeriesExisting = MongoDB_Handler.SeriesExists(ContentData, NewContent_LocationsObject.Title, ref NewContentOutput);
                Console.WriteLine($"isSeriesExisting:{isSeriesExisting}");

                if (!isSeriesExisting)
                    return;

                isSeasonExisting = MongoDB_Handler.SeasonExists(LocationsData[NewContentOutput.ID].Series, NewContent_LocationsObject.SeasonNum, ref SeasonOutput);
                Console.WriteLine($"isSeasonExisting:{isSeasonExisting} {NewContent_LocationsObject.SeasonNum}");

                if (!isSeasonExisting)
                    return;

                isEpisodeExisting = MongoDB_Handler.EpisodeExists(SeasonOutput, NewContent_LocationsObject.EpisodeNum, ref EpisodeOutput);
                Console.WriteLine($"isEpisodeExisting:{isEpisodeExisting}");

            }
            finally
            {
                AddLog("DataExistingCheck Ended");
            }
        }


        void AddDataToMongoDB(FileHandler.ScrapperContent NewContent_JsonObject, IMongoCollection<FileHandler.Locations.Main> LocationsCollection, List<FileHandler.Locations.Main> LocationsData)
        {


            string Path = $"/Series/Season_{NewContent_JsonObject.SeasonNum}/{NewContent_JsonObject.EpisodeNum}/{NewContent_JsonObject.EpisodeNum}.mp4";

            FileHandler.Locations.Episode NewEpisode = new FileHandler.Locations.Episode
            {
                EpisodeNum = NewContent_JsonObject.EpisodeNum,
                Thumbnail = "Thumbnail.jpg",
                Path = Path,
                Title = NewContent_JsonObject.EpisodeTitle,
                Description = NewContent_JsonObject.Episode_Description,
                Duration = DurationMiliseconds,
            };

            if (!isSeriesExisting)
            {
                FileHandler.NewContent NewContent = new FileHandler.NewContent
                {
                    ID = LocationsData.Count,
                    Title = NewContent_JsonObject.Title,
                    Description = NewContent_JsonObject.Description,
                    Availability = "",
                    Genre = "",
                    Started = NewContent_JsonObject.Started,
                    Ended = NewContent_JsonObject.Ended,
                    Director = NewContent_JsonObject.Director,
                    Producer = NewContent_JsonObject.Producer,

                };

                MongoDB_Handler.AddNewSeries("Content", database, NewContent, LocationsCollection, NewEpisode, NewContent_JsonObject.SeasonNum);
                return;
            }

            if (!isSeasonExisting)
            {
                MongoDB_Handler.AddNewSeason(NewContent_JsonObject, LocationsCollection, LocationsData, NewContentOutput.ID, NewEpisode);
                return;
            }


            MongoDB_Handler.AddNewEpisode(NewContent_JsonObject, LocationsCollection, LocationsData, NewContentOutput.ID, SeasonOutput, NewEpisode);
        }

        void MoveMediaFile(List<FileHandler.Locations.Main> LocationsData, FileHandler.ScrapperContent NewContent_JsonObject)
        {

            int ContentID = NewContentOutput != null ? NewContentOutput.ID : LocationsData.Count;
            Console.WriteLine($"ContentID: {ContentID}");
            int SeasonNum = NewContent_JsonObject.SeasonNum;
            int EpisodeNum = NewContent_JsonObject.EpisodeNum;
            string Title = NewContent_JsonObject.Title;

            string EpisodePath = $"{serverDataPath}/{ContentID}/Series/Season_{SeasonNum}/{EpisodeNum}";
            string Path = $"/Series/Season_{SeasonNum}/{EpisodeNum}/{EpisodeNum}.mp4";
            string VideoFileName = $"{Title}_{SeasonNum}_{EpisodeNum}".Replace(" ", "_");

            Directory.CreateDirectory($"{serverDataPath}/{ContentID}");
            Directory.CreateDirectory($"{serverDataPath}/{ContentID}/Movie");
            Directory.CreateDirectory($"{serverDataPath}/{ContentID}/Series");
            Directory.CreateDirectory($"{serverDataPath}/{ContentID}/Series/Season_{SeasonNum}");
            Directory.CreateDirectory(EpisodePath);

            File.Move($"{processesPath}/{VideoFileName}.mp4", $"{serverDataPath}/{ContentID}/{Path}");
            File.Move($"{processesPath}/SeekSliderPreview.png", $"{EpisodePath}/SeekSliderPreview.png");
            File.Move($"{processesPath}/Thumbnail.jpg", $"{EpisodePath}/Thumbnail.jpg");

            if (!isSeriesExisting)
                webClient.DownloadFile(NewContent_JsonObject.CoverURL, $"{serverDataPath}/{ContentID}/Cover.jpg");
        }

        #region Old MoveFiles
        void MoveFiles()
        {
            string NewContent_JsonFile = File.ReadAllText(NewContentJsonPath);
            var NewContent_JsonObject = JsonConvert.DeserializeObject<FileHandler.ScrapperContent>(NewContent_JsonFile);

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
        void Move_ExistingContent(int index, FileHandler.ScrapperContent NewContent_JsonObject, List<FileHandler.Data_Content> Content_JsonObject, bool NewContent = false)
        {
            try
            {
                int NewContentSeason = NewContent_JsonObject.SeasonNum;
                int ContentID = Content_JsonObject[index].ID;
                string LocationFile_Path = $"{serverDataPath}/{ContentID}/Locations.json";// $"{currentPath}/Locations.json";
                                                                                          // string LocationFile = File.ReadAllText($"{serverDataPath}/{ContentID}/Locations.json");
                                                                                          //var LocationObject = JsonConvert.DeserializeObject<FileHandler.Locations.Main>(LocationFile);

                int Episode = NewContent_JsonObject.EpisodeNum;
                string Path = $"/Series/Season_{NewContentSeason}/{Episode}/{NewContent_JsonObject.EpisodeNum}.mp4";
                string EpisodeTitle = NewContent_JsonObject.EpisodeTitle;
                string Description = NewContent_JsonObject.Episode_Description;
                long Duration = (long)GetContentDuration();// NewContent_JsonObject.Duration;

                string EpisodePath = $"{serverDataPath}/{ContentID}/Series/Season_{NewContentSeason}/{Episode}";
                string VideoFileName = $"{NewContent_JsonObject.Title}_{NewContent_JsonObject.SeasonNum}_{Episode}".Replace(" ", "_");
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
        #endregion


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

        async Task<double> GetContentDurationNEW(string Media_FileName)
        {
            await RunCmd($"{ffmpegPath} -i {Media_FileName}.mp4 2> VideoInfo.txt", hidden: true, systemArguments: true);

            string path = $"{processesPath}/VideoInfo.txt";
            if (!File.Exists(path))
                throw new Exception("GetContentDurationNEW: VideoInfo.txt doesnt exist");

            string[] videoInfoFile = File.ReadAllLines(path);
            foreach (var item in videoInfoFile)
            {
                if (item.Contains("Duration:"))
                {
                    int timeStampBegin = 12;
                    string timeStamp = item.Substring(timeStampBegin).Split(',')[0];
                    double duration = TimeSpan.Parse(timeStamp).TotalMilliseconds;
                    return duration;
                }
            }
            throw new Exception("Duration cannot found");
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
                    string masterURL = item.Split('\'')[3];
                    //Console.WriteLine("masterURL: " + masterURL);
                    webClient.DownloadFile(masterURL, $"{processesPath}/master.m3u8");
                    AddLog("master.m3u8 successfully downloaded");
                    return;
                }
                // Console.WriteLine("running.....");
            }
        }

        async Task Download_RawVideo(string Media_FileName)
        {
            AddLog("Downloading Raw Video");
            WebClient webClient = new WebClient();
            webClient.DownloadProgressChanged += WebClient_DownloadProgressChanged;

            string[] a = File.ReadAllLines(processesPath + "/video.html");
            foreach (var item in a)
            {
                if (item.Contains("voe-network.net/engine/mp4"))
                {
                    string rawVideoURL = item.Split('\'')[3];
                    Console.WriteLine("rawVideoURL: " + rawVideoURL);
                    await webClient.DownloadFileTaskAsync(rawVideoURL, $"{processesPath}/{Media_FileName}.mp4");
                    // webClient.DownloadFileAsync(new Uri(rawVideoURL), $"{processesPath}/{Media_FileName}.mp4");

                    AddLog("Raw Video successfully downloaded");
                    return;
                }
            }
        }

        private void WebClient_DownloadProgressChanged(object sender, DownloadProgressChangedEventArgs e)
        {
            Console.WriteLine("downloaded {0} of {1} bytes. {2} % complete...", e.BytesReceived, e.TotalBytesToReceive, e.ProgressPercentage);
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

        async Task GeneratePreviewImagesAndThumbnail(string fileName, double DurationMiliseconds)
        {
            //27s => 27/60 => 0.45
            //0.45/0.4 => (0.18 < 1) => 1
            string Fixed_FileName = fileName.Replace(" ", "_");

            int Scale = 80;
            int Columns = 10;
            double RandomConstant = 0.4;

            var DurationSeconds = DurationMiliseconds / 1000;
            var DurationMinutes = DurationSeconds / 60;
            var SecondsPerImage = Math.Ceiling(DurationMinutes * RandomConstant);
            var ImageRows = Math.Ceiling(DurationSeconds / SecondsPerImage / Columns);


            Directory.CreateDirectory($"{processesPath}/img");
            AddLog("Generating Preview Images...");
            await RunCmd($"{ffmpegPath} -i {Fixed_FileName}.mp4 -vf fps=1/10 -q:v 50 img/image_%d.jpg", hidden: true, systemArguments: true);// Every 10 seconds one image
            await RunCmd($"{ffmpegPath} -i img/image_%d.jpg -filter_complex \"scale = {Scale}:-1, tile = {Columns}x{ImageRows}\" SeekSliderPreview.png", hidden: true, systemArguments: true); // Merge all images to one image
            AddLog("Preview Images Generated");

            AddLog("Generating Thumbnail...");
            int MiddleContentLength = Convert.ToInt32(DurationSeconds / 2);
            await RunCmd($"{ffmpegPath} -ss {MiddleContentLength} -i {Fixed_FileName}.mp4 -qscale:v 1 -frames:v 1 Thumbnail.jpg", hidden: true, systemArguments: true);
            AddLog("Thumbnail Generated");

        }


        void AddLog(string text)
        {
            try
            {
                Console.WriteLine(text);
                Logs += text + "\n";
                LogAdded?.Invoke(text + "\n");
            }
            catch (Exception ex)
            {
                Console.WriteLine("AddLog Error:" + ex.Message);
            }
        }

    }
}
