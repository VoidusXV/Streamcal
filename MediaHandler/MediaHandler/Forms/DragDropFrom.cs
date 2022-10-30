using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace MediaHandler.Forms
{
    public partial class DragDropFrom : Form
    {
        public DragDropFrom()
        {
            InitializeComponent();
        }

        private void panel1_DragDrop(object sender, DragEventArgs e)
        {
            string[] files = (string[])e.Data.GetData(DataFormats.FileDrop);
            string fileFormat = Path.GetExtension(files[0]).ToLower();

            if (!fileFormat.Contains("mp4"))
            {
                MessageBox.Show("Please Drag & Drop an MP4 File", "Wrong File Format", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }

            Console.WriteLine("Yeeet");


        }

        private void panel1_DragEnter(object sender, DragEventArgs e)
        {
            e.Effect = DragDropEffects.All;
        }
    }
}
