using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using Newtonsoft.Json;

namespace MediaHandler
{
    public class JsonHandler
    {
        public static void Add_NewEpisode(int Episode, string Path, string Title, string Description, long Duration, int NewContentSeason, string jsonPath)
        {
            FileHandler.Locations.Episodes NewEpisode = new FileHandler.Locations.Episodes
            {
                Episode = Episode,
                Thumbnail = "Thumbnail.jpg",
                Path = Path,
                Title = Title,
                Description = Description,
                Duration = Duration,
            };
            int NewContentSeason_Index = 0;

            var temp = JsonConvert.DeserializeObject<FileHandler.Locations.Main>(File.ReadAllText(jsonPath));
            foreach (var item in temp.Series.Seasons)
            {
                if (NewContentSeason == item.SeasonNum)
                    break;
                NewContentSeason_Index++;
            }

            //temp.Series.Seasons[NewContentSeason_Index].Episodes.Add(NewEpisode); //Old

            // Sort Episode

            Console.WriteLine("Sort Episode");
            int EpisodeCount = temp.Series.Seasons[NewContentSeason_Index].Episodes.Count;


            for (int i = 0; i < EpisodeCount; i++)
            {
                if (temp.Series.Seasons[NewContentSeason_Index].Episodes[i].Episode > Episode)
                {
                    Console.WriteLine($"Episode Insert at {i}");
                    temp.Series.Seasons[NewContentSeason_Index].Episodes.Insert(i, NewEpisode);
                    File.WriteAllText(jsonPath, JsonConvert.SerializeObject(temp, Formatting.Indented));

                    return;
                }
            }

            temp.Series.Seasons[NewContentSeason_Index].Episodes.Add(NewEpisode);
            File.WriteAllText(jsonPath, JsonConvert.SerializeObject(temp, Formatting.Indented));

        }


        public static void Add_NewSeason(string jsonPath, int NewContentSeason, List<FileHandler.Locations.Episodes> Episode = null)
        {
            if (Episode == null)
                Episode = new List<FileHandler.Locations.Episodes>();

            FileHandler.Locations.Season NewSeason = new FileHandler.Locations.Season
            {
                SeasonNum = NewContentSeason,
                Episodes = Episode,
            };


            FileHandler.Locations.Main temp = new FileHandler.Locations.Main();

            if (!File.Exists(jsonPath))
            {
                temp = new FileHandler.Locations.Main
                {
                    Series = new FileHandler.Locations.Series
                    {
                        Seasons = new List<FileHandler.Locations.Season> { NewSeason }
                    },
                    Movies = new FileHandler.Locations.Movies(),
                };
            }
            else
            {
                temp = JsonConvert.DeserializeObject<FileHandler.Locations.Main>(File.ReadAllText(jsonPath));
                //temp.Series.Seasons.Add(NewSeason); Old 

                // Sort Season

                Console.WriteLine("Sort Season");
                for (int i = 0; i < temp.Series.Seasons.Count; i++)
                {
                    if (temp.Series.Seasons[i].SeasonNum > NewContentSeason)
                    {
                        temp.Series.Seasons.Insert(i, NewSeason);
                        File.WriteAllText(jsonPath, JsonConvert.SerializeObject(temp, Formatting.Indented));
                        return;
                    }
                }
            }

            temp.Series.Seasons.Add(NewSeason);
            File.WriteAllText(jsonPath, JsonConvert.SerializeObject(temp, Formatting.Indented));
        }

        public static bool SeasonExists(string jsonPath, int NewContentSeason)
        {
            if (!File.Exists(jsonPath))
                return false;

            var LocationObject = JsonConvert.DeserializeObject<FileHandler.Locations.Main>(File.ReadAllText(jsonPath));
            for (int i = 0; i < LocationObject.Series.Seasons.Count; i++)
            {
                if (NewContentSeason == LocationObject.Series.Seasons[i].SeasonNum)
                    return true;
            }
            return false;
        }

        public static void Add_NewContent(string jsonPath, string ContentData, FileHandler.NewContent NewContent)
        {
            var temp = JsonConvert.DeserializeObject<List<FileHandler.NewContent>>(ContentData);
            temp.Add(NewContent);
            File.WriteAllText(jsonPath, JsonConvert.SerializeObject(temp, Formatting.Indented));

        }

        public static bool ContentExists(string ContentData, string Title)
        {
            var LocationObject = JsonConvert.DeserializeObject<List<FileHandler.NewContent>>(ContentData);
            for (int i = 0; i < LocationObject.Count; i++)
            {
                if (Title == LocationObject[i].Title)
                    return true;
            }
            return false;
        }
    }
}
