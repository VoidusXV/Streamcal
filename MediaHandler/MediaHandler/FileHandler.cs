using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediaHandler
{
    public class FileHandler
    {
        public class NewContent_Locations
        {
            public string Title { get; set; }
            public string Description { get; set; }
            public string EpisodeTitle { get; set; }
            public string Episode_Description { get; set; }
            public int Episode { get; set; }
            public int Season { get; set; }
            public int Started { get; set; }
            public int Ended { get; set; }
            public long Duration { get; set; }
            public string Director { get; set; }
            public string Producer { get; set; }
            public string CoverURL { get; set; }


        }
        public class NewContent
        {
            public int ID { get; set; }
            public string Description { get; set; }
            public string Title { get; set; }
            public string Availability { get; set; }
            public string Genre { get; set; }

        }


        public class Data_Content
        {
            public int ID { get; set; }
            public string Title { get; set; }
            public string Description { get; set; }
            public string Availability { get; set; }
            public string Genre { get; set; }
        }

        public class Locations
        {
            public class Main
            {
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
                public List<Episodes> Episodes { get; set; }
            }

            public class Episodes
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
