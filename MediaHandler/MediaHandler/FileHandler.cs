using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediaHandler
{
    public class FileHandler
    {
        public class ScrapperContent
        {
            public string Title { get; set; }
            public string Description { get; set; }
            public string EpisodeTitle { get; set; }
            public string Episode_Description { get; set; }
            public int EpisodeNum { get; set; }
            public int SeasonNum { get; set; }
            public string Started { get; set; }
            public string Ended { get; set; }
            public long Duration { get; set; }
            public string Director { get; set; }
            public string Producer { get; set; }
            public string CoverURL { get; set; }


        }
       
        public class NewContent
        {
            [BsonId]
            [BsonRepresentation(MongoDB.Bson.BsonType.ObjectId)]
            public string MongoDB_ID { get; set; }
            public int ID { get; set; }
            public string Description { get; set; }
            public string Title { get; set; }
            public string Availability { get; set; }
            public string Genre { get; set; }
            public string Started { get; set; }
            public string Ended { get; set; }
            public string Director { get; set; }
            public string Producer { get; set; }

        }

        // NewContent and Data_Content are the same classes
        public class Data_Content
        {
            public int ID { get; set; }
            public string Description { get; set; }
            public string Title { get; set; }

            public string Availability { get; set; }
            public string Genre { get; set; }
            public string Started { get; set; }
            public string Ended { get; set; }
            public string Director { get; set; }
            public string Producer { get; set; }
        }

        public class Locations
        {
           
            public class Main
            {
                [BsonId]
                [BsonRepresentation(MongoDB.Bson.BsonType.ObjectId)]
                [BsonIgnoreIfDefault]
                public string MongoDB_ID { get; set; }
                public Series Series { get; set; }
                public Movies Movies { get; set; }
            }

            public class Movies
            {

            }

            public class Series
            {
                public List<Season> Seasons { get; set; }
            }

            public class Season
            {
                public int SeasonNum { get; set; }
                public List<Episode> Episodes { get; set; }
            }

            public class Episode
            {
                public int EpisodeNum { get; set; }
                public string Thumbnail { get; set; }
                public string Path { get; set; }
                public string Title { get; set; }
                public string Description { get; set; }
                public long Duration { get; set; }
            }
        }
    }
}
