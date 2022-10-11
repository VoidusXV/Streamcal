using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace MediaHandler
{
    public partial class ProcessForm : Form
    {

        List<ScrapperProcess> scrapperProcesses;
        public ProcessForm(string text)
        {
            InitializeComponent();
            richTextBox1.Text = text;

            //scrapperProcesses = Form1.CurrentProcesses;
            //Add_IDs();

        }
        public ProcessForm(List<ScrapperProcess> scrapperProcesses)
        {
            InitializeComponent();
            this.scrapperProcesses = scrapperProcesses;
            Add_IDs();

        }

        void Add_IDs()
        {
            for (int i = 0; i < scrapperProcesses.Count; i++)
            {
                listBox1.Items.Add(i.ToString());
                scrapperProcesses[i].LogAdded += ProcessForm_LogAdded;
            }
        }

        private void ProcessForm_LogAdded(string text)
        {
            richTextBox1.AppendText(text);
        }



        private void listBox1_SelectedIndexChanged(object sender, EventArgs e)
        {
            try
            {
                Console.WriteLine(listBox1.SelectedIndex);
                richTextBox1.Text = scrapperProcesses[listBox1.SelectedIndex].Logs;
                label4.Text = "URL: " + scrapperProcesses[listBox1.SelectedIndex].URL;
                // label4.Text = "URL: " + scrapperProcesses[listBox1.SelectedIndex].Logs;
                // richTextBox1.Text = scrapperProcesses[listBox1.SelectedIndex].Logs;
            }
            catch (Exception ex)
            {

                Console.WriteLine("Error:" + ex.Message);
            }

        }
    }
}
