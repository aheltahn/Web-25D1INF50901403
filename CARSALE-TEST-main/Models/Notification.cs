namespace CARSALE.Models
{
    public class Notification
    {
        public int NotificationID { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime SentDate { get; set; }
        public int UserID { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreateDatetime { get; set; }
    }
}