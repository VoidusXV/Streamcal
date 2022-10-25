using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediaHandler
{
    class MongoDB_Handler
    {

        public static bool SeriesExists(List<FileHandler.NewContent> CollectionData, string CompareTitle, ref FileHandler.NewContent Series)
        {
            FileHandler.NewContent FindContent = CollectionData.Find(x => x.GetType().GetProperty("Title").GetValue(x).ToString() == CompareTitle);
            if (FindContent == null)
                return false;

            Series = FindContent;
            return true;
        }

        public static bool SeasonExists(FileHandler.Locations.Series SeriesData, int CompareSeason, ref FileHandler.Locations.Season Season)
        {
            var FindSeason = SeriesData.Seasons.Find(x => x.SeasonNum == CompareSeason);
            if (FindSeason == null)
                return false;

            Season = FindSeason;
            return true;
        }

        public static bool EpisodeExists(FileHandler.Locations.Season SeasonData, int CompareEpisodeNum, ref FileHandler.Locations.Episode Episode)
        {

            var FindSeason = SeasonData.Episodes.Find(x => x.EpisodeNum == CompareEpisodeNum);
            if (FindSeason == null)
                return false;

            Episode = FindSeason;
            return true;
        }


        public static void AddNewSeries(string CollectionName, IMongoDatabase database, FileHandler.NewContent NewContent, IMongoCollection<FileHandler.Locations.Main> LocationsCollection, FileHandler.Locations.Episode Episode, int SeasonNum)
        {

            database.GetCollection<FileHandler.NewContent>(CollectionName).InsertOne(NewContent);
            FileHandler.Locations.Main NewLocation = new FileHandler.Locations.Main
            {
                Series = new FileHandler.Locations.Series
                {
                    Seasons = new List<FileHandler.Locations.Season>
                    {
                        new FileHandler.Locations.Season
                        {
                            SeasonNum = SeasonNum,
                            Episodes = new List<FileHandler.Locations.Episode> { Episode }
                        }
                    }
                },

                Movies = new FileHandler.Locations.Movies { }
            };
            LocationsCollection.InsertOne(NewLocation);
        }

        public static void AddNewSeason(FileHandler.ScrapperContent NewContent_LocationsObject, IMongoCollection<FileHandler.Locations.Main> LocationsCollection, List<FileHandler.Locations.Main> LocationsData, int index, FileHandler.Locations.Episode NewEpisode)
        {

            FileHandler.Locations.Season NewSeason = new FileHandler.Locations.Season
            {
                SeasonNum = NewContent_LocationsObject.SeasonNum,
                Episodes = new List<FileHandler.Locations.Episode> { NewEpisode }
            };


            bool isSeasonNumWithBiggestNum =
                LocationsData[index].Series.Seasons.Find(x => x.SeasonNum > NewContent_LocationsObject.SeasonNum) == null ? true : false;

            if (LocationsData[index].Series.Seasons.Count == 0 || isSeasonNumWithBiggestNum)
                LocationsData[index].Series.Seasons.Add(NewSeason);
            else
            {
                int insertIndex = LocationsData[index].Series.Seasons.FindLastIndex(x => x.SeasonNum < NewContent_LocationsObject.SeasonNum);
                LocationsData[index].Series.Seasons.Insert(insertIndex + 1, NewSeason);
            }


            var update = Builders<FileHandler.Locations.Main>.Update.Set("Series", new FileHandler.Locations.Series
            {
                Seasons = LocationsData[index].Series.Seasons
            });

            LocationsCollection.UpdateOne(x => x.MongoDB_ID == LocationsData[index].MongoDB_ID, update);
            Console.WriteLine("New Season Added");
        }

        public static void AddNewEpisode(FileHandler.ScrapperContent NewContent_LocationsObject, IMongoCollection<FileHandler.Locations.Main> LocationsCollection, List<FileHandler.Locations.Main> LocationsData, int index, FileHandler.Locations.Season Season, FileHandler.Locations.Episode NewEpisode)
        {


            List<FileHandler.Locations.Episode> Episodes = Season.Episodes;

            bool isEpisodeNumWithBiggestNum =
             Episodes.Find(x => x.EpisodeNum > NewContent_LocationsObject.EpisodeNum) == null ? true : false;

            if (Episodes.Count == 0 || isEpisodeNumWithBiggestNum)
                Episodes.Add(NewEpisode);
            else
            {
                int insertIndex = Episodes.FindLastIndex(x => x.EpisodeNum < NewContent_LocationsObject.EpisodeNum);
                Episodes.Insert(insertIndex + 1, NewEpisode);
            }


            LocationsData[index].Series.Seasons.Find(x => x == Season).Episodes = Episodes;

            var update = Builders<FileHandler.Locations.Main>.Update.Set("Series", new FileHandler.Locations.Series
            {
                Seasons = LocationsData[index].Series.Seasons
            });

            LocationsCollection.UpdateOne(x => x.MongoDB_ID == LocationsData[index].MongoDB_ID, update);
            Console.WriteLine("New Episode Added");
        }


        // AddNewEpisode && AddNewSeason refactoring needed!!!

        public static ProjectionDefinition<T> ExcludeID<T>(T u)
        {
            return Builders<T>.Projection.Exclude(x => u);
        }
        public static List<FileHandler.NewContent> FetchCollection(IMongoDatabase database, string CollectionName, ProjectionDefinition<FileHandler.NewContent> Projection = null)
        {

            var Collection = database.GetCollection<FileHandler.NewContent>(CollectionName);
            List<FileHandler.NewContent> LocationsData;

            if (Projection != null)
                LocationsData = Collection.Find(x => true).Project<FileHandler.NewContent>(Projection).ToList();
            else
                LocationsData = Collection.Find(x => true).ToList();


            return LocationsData;
        }
    }
}
