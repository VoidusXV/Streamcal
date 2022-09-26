using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace MediaHandler
{
    public partial class APIKEY_Generator : Form
    {
        public APIKEY_Generator()
        {
            InitializeComponent();
        }

        string GenerateAPIKEY()
        {
            string Numbers = "0123456789";
            string UpperAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

            string[] All = { Numbers, UpperAlphabet };

            string apikey = "";
            int randomNum = 0;

            Random random = new Random();
            for (int i = 0; i < 25; i++)
            {
                if (i % 5 == 0 && i > 1)
                    apikey += "-";

                randomNum = random.Next(All.Length);
                if (randomNum == 0) //Numbers
                {
                    randomNum = random.Next(Numbers.Length);
                    apikey += Numbers[randomNum];
                }
                else //UpperAlphabet
                {
                    randomNum = random.Next(UpperAlphabet.Length);
                    apikey += UpperAlphabet[randomNum];
                }


            }
            return apikey;
        }
        private void button2_Click(object sender, EventArgs e)
        {
            if (pictureBox1.Image == null)
                return;

            Clipboard.SetImage(pictureBox1.Image);
            MessageBox.Show("QR-Code copied");
        }

        private void button1_Click(object sender, EventArgs e)
        {
            //https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=Example
        }

        private void button6_Click(object sender, EventArgs e)
        {
            string APIKEY = GenerateAPIKEY();
            textBox2.Text = APIKEY;

            WebClient webClient = new WebClient();
            byte[] QR_Data = webClient.DownloadData($"https://api.qrserver.com/v1/create-qr-code/?size=300x300&data={APIKEY}");
            Stream stream = new MemoryStream(QR_Data);
            pictureBox1.Image = Image.FromStream(stream);

        }
    }
}
