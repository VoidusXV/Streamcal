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
                Cover = "Cover.jpg",
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

            var temp = JsonConvert.DeserializeObject<FileHandler.Locations.Main>(File.ReadAllText(jsonPath));
            temp.Series.Seasons.Add(NewSeason);
            File.WriteAllText(jsonPath, JsonConvert.SerializeObject(temp, Formatting.Indented));
        }


        public static bool SeasonExists(string jsonPath, int NewContentSeason)
        {
            var LocationObject = JsonConvert.DeserializeObject<FileHandler.Locations.Main>(File.ReadAllText(jsonPath));
            for (int i = 0; i < LocationObject.Series.Seasons.Count; i++)
            {
                if (NewContentSeason == LocationObject.Series.Seasons[i].SeasonNum)
                    return true;
            }
            return false;
        }
    }
}
