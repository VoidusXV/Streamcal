using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediaHandler
{
    public class FileHandler
    {
        public class Series
        {
            public string Title { get; set; }
            public string Description { get; set; }
            public string EpisodeTitle { get; set; }
            public string Episode_Description { get; set; }
            public string Episode { get; set; }
            public string Season { get; set; }
            public string Started { get; set; }
            public string Ended { get; set; }
            public string Director { get; set; }
            public string Producer { get; set; }

        }

        public class Data_Content
        {
            public int ID { get; set; }
            public string Title { get; set; }
            public string Description { get; set; }
            public string Availability { get; set; }
            public string Genre { get; set; }
        }
    }
}
