using Microsoft.AspNetCore.SignalR;

namespace pr_examen.Hubs
{
    public class ChatHub : Hub
    {
        private static readonly Dictionary<string, string> AutoResponses = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            { "привіт", "Вікторія: Привіт!" },
            { "як справи?", "Марк: Все добре, а в тебе?" },
            { "до побачення", "Оксана: До зустрічі!" },
            { "вечір добрий", "Іван: Добрий вечір!" },
            { "що робиш?", "Наталя: Працюю, вивчаю нові технології" }
        };

        private static readonly List<string> BotNames = new List<string>
        {
            "Вікторія", "Марк", "Оксана", "Іван", "Наталя"
        };

        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
            await CheckForAutoResponse(message);
        }

        private async Task CheckForAutoResponse(string message)
        {
            foreach (var response in AutoResponses)
            {
                if (message.Trim().ToLowerInvariant().Contains(response.Key))
                {
                    await Clients.All.SendAsync("ReceiveMessage", "Система", response.Value);
                    break;
                }
            }
        }

        public List<string> GetBotNames()
        {
            return BotNames;
        }
    }
}