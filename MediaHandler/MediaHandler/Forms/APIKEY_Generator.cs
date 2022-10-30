using Newtonsoft.Json;
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
        Random random = new Random();

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

            // Random random = new Random();
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

        class QRCode_Json
        {
            public string APIKEY { get; set; }
            public string Server { get; set; }
            public string Port { get; set; }
            public string AdminKey { get; set; }


        }

        void Gen(bool isAdminKey = false)
        {
            if (string.IsNullOrEmpty(textBox1.Text) || string.IsNullOrWhiteSpace(textBox1.Text))
            {
                MessageBox.Show("Server Domain is empty, please write a Server Domain", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }
            if (string.IsNullOrEmpty(textBox3.Text) || string.IsNullOrWhiteSpace(textBox3.Text))
            {
                MessageBox.Show("Port is empty, please write a Port", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }

            string APIKEY = GenerateAPIKEY();
            string AdminKey = "";



            textBox2.Text = APIKEY;

            if (isAdminKey)
            {
                AdminKey = GenerateAPIKEY();
                textBox4.Text = AdminKey;
            }

            QRCode_Json QRCode_Json = new QRCode_Json
            {
                APIKEY = APIKEY,
                Server = textBox1.Text,
                Port = textBox3.Text,
                AdminKey = !isAdminKey ? "" : AdminKey,
            };

            var QRCode_JsonObject = JsonConvert.SerializeObject(QRCode_Json);

            WebClient webClient = new WebClient();
            byte[] QR_Data = webClient.DownloadData($"https://api.qrserver.com/v1/create-qr-code/?size=300x300&data={QRCode_JsonObject}");
            Stream stream = new MemoryStream(QR_Data);
            pictureBox1.Image = Image.FromStream(stream);
        }
        private void button6_Click(object sender, EventArgs e)
        {

            Gen();

        }

        private void button1_Click_1(object sender, EventArgs e)
        {
            WebClient webClient = new WebClient();
            string IP = webClient.DownloadString("https://api.ipify.org");
            textBox1.Text = IP;
        }

        private void button3_Click(object sender, EventArgs e)
        {
            textBox3.Text = "3005";
        }

        private void APIKEY_Generator_Load(object sender, EventArgs e)
        {

        }

        private void button4_Click(object sender, EventArgs e)
        {
            Gen(true);
        }
    }
}
