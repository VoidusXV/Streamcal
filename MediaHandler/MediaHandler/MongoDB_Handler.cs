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
            var FindContent = CollectionData.Find(x => x.GetType().GetProperty("Title").GetValue(x).ToString() == CompareTitle);
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

        public static bool EpisodeExists(FileHandler.Locations.Season SeasonData, string CompareTitle, ref FileHandler.Locations.Episode Episode)
        {

            var FindSeason = SeasonData.Episodes.Find(x => x.Title == CompareTitle);
            if (FindSeason == null)
                return false;

            Episode = FindSeason;
            return true;
        }

        public static ProjectionDefinition<T> ExcludeID<T>(T u)
        {
            return Builders<T>.Projection.Exclude(x => u);
        }
        public static List<T> FetchCollection<T>(IMongoDatabase database, string CollectionName, ProjectionDefinition<T> Projection)
        {
            //Console.WriteLine(LocationsData[0].Series.Seasons[0].Episodes[0].GetType().GetProperty("Title").
            //GetValue(LocationsData[0].Series.Seasons[0].Episodes[0]));


            var Collection = database.GetCollection<T>(CollectionName);
            //var Projection = Builders<T>.Projection.Exclude(u => u.GetType().GetProperty("MongoDB_ID").PropertyType);    //.Include(u => u.Series).Include(u => u.Movies);
            var LocationsData = Collection.Find(x => true).Project<T>(Projection).ToList();
            // var LocationsData = Collection.Find(x => true).ToList();

            return LocationsData;
        }
    }
}
