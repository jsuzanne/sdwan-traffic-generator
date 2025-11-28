# SD-WAN Traffic Generator

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Bash](https://img.shields.io/badge/bash-5.0%2B-green.svg)
![Status](https://img.shields.io/badge/status-production-brightgreen.svg)
![Platform](https://img.shields.io/badge/platform-Linux-lightgrey.svg)

A realistic enterprise application traffic generator designed for SD-WAN demonstrations and testing. Generates weighted HTTP/HTTPS traffic to 60+ popular SaaS applications with configurable distribution patterns.

Perfect for **Palo Alto Prisma SD-WAN**, Cisco Viptela, VMware VeloCloud, Fortinet, and any SD-WAN solution requiring realistic application traffic.

## 🎯 Features

- **60+ Enterprise Applications**: Microsoft 365, Google Workspace, Salesforce, Zoom, Slack, AWS, Azure, and more
- **Weighted Traffic Distribution**: Control exact traffic percentages per application category
- **Application-Specific Endpoints**: Uses real API endpoints for accurate SD-WAN application identification
- **Intelligent Backoff**: Progressive retry logic (1 min → 3 hours) for unreachable hosts
- **Real-time Statistics**: JSON metrics updated every 50 requests
- **Systemd Service**: Auto-start on boot with automatic restart on failure
- **Log Rotation**: Automatic log management to prevent disk space issues
- **User-Agent Variety**: Rotates between multiple realistic browser and application agents
- **Multi-Interface Support**: Load balance across multiple network interfaces

## 📊 Use Cases

### SD-WAN Demonstrations
- Generate realistic traffic patterns for customer demos
- Populate SD-WAN dashboards with meaningful application data
- Demonstrate application steering and policy enforcement
- Show real-time path selection and quality metrics

### Testing & Validation
- Validate application identification accuracy
- Test QoS and traffic shaping policies
- Verify failover and path selection logic
- Capacity planning and load testing

### Lab Environments
- Create realistic traffic for training labs
- Simulate enterprise network patterns
- Test new configurations safely
- Benchmark SD-WAN performance

## 🚀 Quick Start

### Prerequisites

- **OS**: Ubuntu 20.04+, Debian 11+, or any systemd-based Linux
- **CPU**: 1 core minimum
- **RAM**: 512 MB minimum
- **Disk**: 500 MB for logs
- **Network**: Internet access via HTTP/HTTPS (ports 80/443)
- **Tools**: `curl`, `bash` 4.0+, `jq` (optional, for JSON viewing)

### Installation

#### Method 1: Quick Install (Recommended)

Download and extract
wget https://github.com/jsuzanne/sdwan-traffic-generator/archive/refs/heads/main.zip
unzip main.zip
cd sdwan-traffic-generator-main

Install
chmod +x install.sh
sudo ./install.sh

Start the service
sudo systemctl start sdwan-traffic-gen
sudo systemctl enable sdwan-traffic-gen

Verify it's running
sudo systemctl status sdwan-traffic-gen
tail -f /var/log/sdwan-traffic-gen/traffic.log

text

#### Method 2: Git Clone

Clone the repository
git clone https://github.com/jsuzanne/sdwan-traffic-generator.git
cd sdwan-traffic-generator

Install
chmod +x install.sh
sudo ./install.sh

Start
sudo systemctl start sdwan-traffic-gen
sudo systemctl enable sdwan-traffic-gen

text

#### Method 3: Manual Installation

Create directories
sudo mkdir -p /opt/sdwan-traffic-gen/config
sudo mkdir -p /var/log/sdwan-traffic-gen

Copy files
sudo cp traffic-generator.sh /opt/sdwan-traffic-gen/
sudo chmod +x /opt/sdwan-traffic-gen/traffic-generator.sh
sudo cp config/*.txt /opt/sdwan-traffic-gen/config/

Install systemd service
sudo cp systemd/sdwan-traffic-gen.service /etc/systemd/system/
sudo systemctl daemon-reload

Install log rotation
sudo cp logrotate/sdwan-traffic-gen /etc/logrotate.d/

Start
sudo systemctl enable sdwan-traffic-gen
sudo systemctl start sdwan-traffic-gen

text

### First Steps After Installation

1. Check service status
sudo systemctl status sdwan-traffic-gen

2. Watch live traffic generation
tail -f /var/log/sdwan-traffic-gen/traffic.log

3. View statistics (after ~1 minute)
cat /var/log/sdwan-traffic-gen/stats.json | jq

4. Verify on your SD-WAN
Login to your SD-WAN controller and check application statistics
text

## 📖 Usage

### Basic Monitoring

View real-time logs
tail -f /var/log/sdwan-traffic-gen/traffic.log

View statistics
cat /var/log/sdwan-traffic-gen/stats.json | jq

Watch statistics live (updates every 5 seconds)
watch -n 5 'cat /var/log/sdwan-traffic-gen/stats.json 2>/dev/null | jq'

Check service status
sudo systemctl status sdwan-traffic-gen

Count total requests
grep -c SUCCESS /var/log/sdwan-traffic-gen/traffic.log

Top 10 applications by request count
grep SUCCESS /var/log/sdwan-traffic-gen/traffic.log |
awk -F'/' '{print $3}' | awk '{print $1}' |
sort | uniq -c | sort -nr | head -10

text

### Service Management

Start service
sudo systemctl start sdwan-traffic-gen

Stop service
sudo systemctl stop sdwan-traffic-gen

Restart service
sudo systemctl restart sdwan-traffic-gen

Enable auto-start on boot
sudo systemctl enable sdwan-traffic-gen

Disable auto-start
sudo systemctl disable sdwan-traffic-gen

View service logs
sudo journalctl -u sdwan-traffic-gen -f

text

### Customizing Traffic Distribution

#### Quick Edit

Edit application weights
sudo nano /opt/sdwan-traffic-gen/config/applications.txt

Restart to apply changes
sudo systemctl restart sdwan-traffic-gen

text

#### Format
domain|weight|endpoint

text

**Example:**
Higher weight = more traffic
teams.microsoft.com|100|/api/mt/emea/beta/users/
outlook.office365.com|95|/
google.com|50|/
slack.com|45|/api/api.test

text

#### Understanding Weights

Weights are **relative**, not absolute percentages:

teams.microsoft.com|100|/ # 100/200 = 50% of traffic
google.com|50|/ # 50/200 = 25% of traffic
slack.com|50|/api/api.test # 50/200 = 25% of traffic

text

See [Configuration Guide](docs/CONFIGURATION.md#weight-calculation) for detailed examples.

## 🎛️ Default Traffic Distribution

| Category | % | Applications |
|----------|---|--------------|
| Microsoft 365 | 25% | Outlook, Teams, OneDrive, SharePoint, Graph API |
| Google Workspace | 20% | Gmail, Drive, Docs, Meet, Calendar |
| Communication | 15% | Zoom, Slack, Webex, Discord |
| CRM & Sales | 8% | Salesforce, HubSpot, Dynamics 365 |
| Project Management | 7% | Jira, Confluence, Asana, Monday, Trello |
| Cloud Storage | 6% | Dropbox, Box, WeTransfer |
| DevOps | 5% | GitHub, GitLab, Bitbucket, Stack Overflow |
| Cloud Providers | 5% | Azure, AWS, GCP Consoles |
| Business Intelligence | 3% | Tableau, Power BI, Looker |
| HR & Productivity | 2% | Workday, BambooHR, Zenefits |
| Other | 4% | Social Media, Design, Support Tools |

## 📈 Example Output

### Traffic Logs
[2025-11-28 17:20:15] [INFO] Starting SD-WAN Traffic Generator - Client: client01
[2025-11-28 17:20:15] [INFO] client01 requesting https://teams.microsoft.com/api/mt/emea/beta/users/ via eth0 (traceid: 1732812015-client01)
[2025-11-28 17:20:16] [INFO] client01 SUCCESS https://teams.microsoft.com/api/mt/emea/beta/users/ - code: 200
[2025-11-28 17:20:17] [INFO] client01 requesting https://drive.google.com/ via eth0 (traceid: 1732812017-client01)
[2025-11-28 17:20:18] [INFO] client01 SUCCESS https://drive.google.com/ - code: 200
[2025-11-28 17:20:19] [INFO] client01 requesting https://slack.com/api/api.test via eth0 (traceid: 1732812019-client01)
[2025-11-28 17:20:20] [INFO] client01 SUCCESS https://slack.com/api/api.test - code: 200

text

### Statistics JSON
{
"timestamp": 1732812100,
"client_id": "client01",
"total_requests": 250,
"requests_by_app": {
"teams": 47,
"outlook": 45,
"google": 38,
"slack": 32,
"zoom": 28,
"salesforce": 15,
"github": 12
},
"errors_by_app": {
"discord": 2
}
}

text

## 🔧 Configuration

### Network Interfaces

By default, traffic uses `eth0`. To use different or multiple interfaces:

Edit interfaces file
sudo nano /opt/sdwan-traffic-gen/config/interfaces.txt

Example: Multiple interfaces for load balancing
eth0
eth1
ens192

text

Traffic will be randomly distributed across all listed interfaces.

### Request Rate

Modify the sleep time between requests:

sudo nano /opt/sdwan-traffic-gen/traffic-generator.sh

Find and modify:
SLEEP_BETWEEN_REQUESTS=1 # Default: 60 requests/min

Examples:
SLEEP_BETWEEN_REQUESTS=0.5 # 120 requests/min (busier)
SLEEP_BETWEEN_REQUESTS=2 # 30 requests/min (lighter)
SLEEP_BETWEEN_REQUESTS=0.1 # 600 requests/min (heavy load)

text

### User Agents

Customize browser and application signatures:

sudo nano /opt/sdwan-traffic-gen/config/user_agents.txt

Add custom agents, one per line
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15

text

## 🎨 Pre-configured Profiles

### Profile 1: Microsoft-Heavy Enterprise (40% Microsoft)
Edit applications.txt:
Microsoft 365 - 40%
outlook.office365.com|150|/
teams.microsoft.com|140|/api/mt/emea/beta/users/
onedrive.live.com|120|/
sharepoint.com|110|/

Google Workspace - 15%
drive.google.com|60|/
gmail.com|55|/

Others - 45%
zoom.us|80|/
slack.com|70|/

text

### Profile 2: Cloud-Native Startup (30% Cloud Providers)
Cloud Providers - 30%
portal.azure.com|100|/
console.aws.amazon.com|95|/
console.cloud.google.com|90|/

DevOps - 25%
github.com|85|/
gitlab.com|80|/

Collaboration - 20%
slack.com|75|/
zoom.us|70|/

text

### Profile 3: Remote Work (40% Video Conferencing)
Video - 40%
zoom.us|150|/
teams.microsoft.com|140|/
meet.google.com|130|/
webex.com|120|/

Collaboration - 30%
slack.com|110|/
miro.com|100|/

Others - 30%
drive.google.com|90|/

text

See [Configuration Guide](docs/CONFIGURATION.md#custom-profiles-for-different-scenarios) for more examples.

## 🔍 Monitoring & Statistics

### Disk Usage

Check log sizes
du -sh /var/log/sdwan-traffic-gen/

List log files
ls -lh /var/log/sdwan-traffic-gen/

Expected size:
- traffic.log: 0-100 MB (active log)
- traffic.log.1-7.gz: ~100 MB total (compressed archives)
- stats.json: < 10 MB
text

### Performance Metrics

Requests per minute
echo "scale=2; $(grep -c SUCCESS /var/log/sdwan-traffic-gen/traffic.log) /
$(($(date +%s) - $(stat -c %Y /var/log/sdwan-traffic-gen/traffic.log))) * 60" | bc

Success rate
total=$(grep -c "requesting" /var/log/sdwan-traffic-gen/traffic.log)
success=$(grep -c "SUCCESS" /var/log/sdwan-traffic-gen/traffic.log)
echo "scale=2; $success / $total * 100" | bc

Application distribution
grep SUCCESS /var/log/sdwan-traffic-gen/traffic.log |
awk -F'/' '{print $3}' | awk '{print $1}' |
sort | uniq -c | sort -nr |
awk '{printf "%-20s %5d requests (%4.1f%%)\n", $2, $1, $1/total*100}' total=$(grep -c SUCCESS /var/log/sdwan-traffic-gen/traffic.log)

text

## 🐛 Troubleshooting

### Service won't start

Check detailed error
sudo journalctl -u sdwan-traffic-gen -n 50 --no-pager

Test manually
sudo /opt/sdwan-traffic-gen/traffic-generator.sh client01

Verify configuration
ls -la /opt/sdwan-traffic-gen/config/

text

### No traffic in logs

Verify service is running
ps aux | grep traffic-generator

Check network connectivity
curl -I https://google.com

Test specific interface
curl --interface eth0 -I https://teams.microsoft.com

Restart service
sudo systemctl restart sdwan-traffic-gen

text

### Applications not identified in SD-WAN

**Solution 1: Use application-specific endpoints**
Instead of generic paths:
teams.microsoft.com|100|/

Use specific API endpoints:
teams.microsoft.com|100|/api/mt/emea/beta/users/

text

**Solution 2: Enable SSL inspection** on your SD-WAN device (vendor-specific)

**Solution 3: Verify SNI is visible**
sudo tcpdump -i eth0 -n port 443 | grep -i "teams.microsoft"

text

See [Troubleshooting Guide](docs/TROUBLESHOOTING.md) for more solutions.

## 🔄 Updating

Navigate to repository
cd sdwan-traffic-generator

Pull latest changes
git pull origin main

Backup current config
sudo cp /opt/sdwan-traffic-gen/config/applications.txt /tmp/applications.txt.bak

Reinstall
sudo ./install.sh

Restore custom config if needed
sudo cp /tmp/applications.txt.bak /opt/sdwan-traffic-gen/config/applications.txt

Restart
sudo systemctl restart sdwan-traffic-gen

text

## 🗑️ Uninstallation

Stop and disable service
sudo systemctl stop sdwan-traffic-gen
sudo systemctl disable sdwan-traffic-gen

Remove files
sudo rm -rf /opt/sdwan-traffic-gen
sudo rm -rf /var/log/sdwan-traffic-gen
sudo rm /etc/systemd/system/sdwan-traffic-gen.service
sudo rm /etc/logrotate.d/sdwan-traffic-gen

Reload systemd
sudo systemctl daemon-reload

text

## 📚 Documentation

- **[Installation Guide](README.md#installation)** - Complete setup instructions
- **[Configuration Guide](docs/CONFIGURATION.md)** - Detailed configuration options and examples
- **[Troubleshooting Guide](docs/TROUBLESHOOTING.md)** - Common issues and solutions
- **[Usage Guide](docs/USAGE.md)** - Daily operations and monitoring

### Quick Links

- [Creating Custom Traffic Profiles](docs/CONFIGURATION.md#custom-profiles-for-different-scenarios)
- [Setting Target Percentages](docs/CONFIGURATION.md#setting-target-percentages)
- [Weight Calculation Examples](docs/CONFIGURATION.md#weight-calculation)
- [Troubleshooting Service Issues](docs/TROUBLESHOOTING.md#service-issues)
- [Network Connectivity Problems](docs/TROUBLESHOOTING.md#network-connectivity)
- [Performance Tuning](docs/CONFIGURATION.md#traffic-patterns)

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Report Bugs**: Open an issue with detailed reproduction steps
2. **Suggest Features**: Describe your use case and proposed solution
3. **Submit Pull Requests**: 
   - Fork the repository
   - Create a feature branch (`git checkout -b feature/AmazingFeature`)
   - Commit your changes (`git commit -m 'Add AmazingFeature'`)
   - Push to the branch (`git push origin feature/AmazingFeature`)
   - Open a Pull Request

### Development Guidelines

- Follow existing code style and structure
- Test your changes thoroughly
- Update documentation for new features
- Add comments for complex logic

## 🌟 Star History

If you find this project useful, please consider giving it a star! ⭐

[![Star History Chart](https://api.star-history.com/svg?repos=jsuzanne/sdwan-traffic-generator&type=Date)](https://star-history.com/#jsuzanne/sdwan-traffic-generator&Date)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by real-world SD-WAN deployment needs
- Application list based on 2025 enterprise SaaS usage patterns
- Tested with Palo Alto Prisma SD-WAN, Cisco Viptela, and VMware VeloCloud
- Thanks to the SD-WAN community for feedback and suggestions

## 📧 Support & Contact

- **Issues**: https://github.com/jsuzanne/sdwan-traffic-generator/issues
- **Discussions**: https://github.com/jsuzanne/sdwan-traffic-generator/discussions
- **Author**: Julien Suzanne
- **LinkedIn**: [Connect on LinkedIn](https://www.linkedin.com/in/julien-suzanne/)

## 🎓 Use Cases from the Community

> "Essential tool for SD-WAN demos. Saves hours of manual traffic generation!" - Network Engineer

> "Perfect for testing application steering policies in our lab." - Solutions Architect

> "Makes customer demos look professional with realistic traffic patterns." - Pre-Sales Engineer

*Share your use case by opening a discussion!*

## 🚦 Project Status

- ✅ **Stable**: Production-ready for demos and testing
- 🔄 **Active Development**: Regular updates and improvements
- 📖 **Well Documented**: Comprehensive guides and examples
- 🤝 **Community Driven**: Open to contributions and feedback

---

**Made with ❤️ for the SD-WAN community**

*Tested on Ubuntu 22.04/24.04, Debian 11/12*

*Compatible with all major SD-WAN vendors*

---

**⚠️ Disclaimer**: This tool generates real HTTP/HTTPS requests to public SaaS platforms. Use responsibly and ensure you have appropriate network policies in place. Not intended for production network load or stress testing of third-party services.

