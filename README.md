# SD-WAN Traffic Generator

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Bash](https://img.shields.io/badge/bash-5.0%2B-green.svg)
![Status](https://img.shields.io/badge/status-production-brightgreen.svg)

A realistic enterprise application traffic generator designed for SD-WAN demonstrations and testing. Generates weighted HTTP/HTTPS traffic to 60+ popular SaaS applications with configurable distribution patterns.

## 🎯 Features

- **60+ Enterprise Applications**: Microsoft 365, Google Workspace, Salesforce, Zoom, Slack, AWS, Azure, and more
- **Weighted Traffic Distribution**: Control exact traffic percentages per application category
- **Application-Specific Endpoints**: Uses real API endpoints for accurate SD-WAN application identification
- **Intelligent Backoff**: Progressive retry logic (1 min → 3 hours) for unreachable hosts
- **Real-time Statistics**: JSON metrics updated every 50 requests
- **Systemd Service**: Auto-start on boot with automatic restart on failure
- **Log Rotation**: Automatic log management to prevent disk space issues
- **User-Agent Variety**: Rotates between multiple realistic browser and application agents

## 📊 Use Cases

- **SD-WAN Demos**: Generate realistic traffic patterns for Palo Alto Prisma, Cisco Viptela, VMware VeloCloud, etc.
- **Policy Testing**: Validate application identification and steering policies
- **Capacity Planning**: Simulate enterprise traffic loads
- **Lab Environments**: Populate SD-WAN analytics with meaningful data

## 🚀 Quick Start

### Prerequisites

- Linux system (Ubuntu/Debian tested)
- Bash 4.0+
- `curl` installed
- Root/sudo access

### Installation
## 🚀 Installation

### System Requirements

- **OS**: Ubuntu 20.04+, Debian 11+, or any systemd-based Linux
- **CPU**: 1 core minimum
- **RAM**: 512 MB minimum
- **Disk**: 500 MB for logs
- **Network**: Internet access via HTTP/HTTPS (ports 80/443)
- **Tools**: `curl`, `bash` 4.0+, `jq` (optional, for JSON viewing)

### Quick Install (Recommended)

1. Download the installer
wget https://github.com/jsuzanne/sdwan-traffic-generator/archive/refs/heads/main.zip
unzip main.zip
cd sdwan-traffic-generator-main

2. Run the installation script
chmod +x install.sh
sudo ./install.sh

3. Start the service
sudo systemctl start sdwan-traffic-gen
sudo systemctl enable sdwan-traffic-gen

4. Verify it's running
sudo systemctl status sdwan-traffic-gen
tail -f /var/log/sdwan-traffic-gen/traffic.log

text

That's it! Traffic generation should start immediately.

### Manual Installation

If you prefer to install manually:

1. Create directories
sudo mkdir -p /opt/sdwan-traffic-gen/config
sudo mkdir -p /var/log/sdwan-traffic-gen

2. Copy main script
sudo cp traffic-generator.sh /opt/sdwan-traffic-gen/
sudo chmod +x /opt/sdwan-traffic-gen/traffic-generator.sh

3. Copy configuration files
sudo cp config/applications.txt /opt/sdwan-traffic-gen/config/
sudo cp config/interfaces.txt /opt/sdwan-traffic-gen/config/
sudo cp config/user_agents.txt /opt/sdwan-traffic-gen/config/

4. Install systemd service
sudo cp systemd/sdwan-traffic-gen.service /etc/systemd/system/
sudo systemctl daemon-reload

5. Install log rotation
sudo cp logrotate/sdwan-traffic-gen /etc/logrotate.d/

6. Start the service
sudo systemctl enable sdwan-traffic-gen
sudo systemctl start sdwan-traffic-gen

text

### Git Clone Method

Clone the repository
git clone https://github.com/jsuzanne/sdwan-traffic-generator.git
cd sdwan-traffic-generator

Run installer
chmod +x install.sh
sudo ./install.sh

text

### Docker Installation (Coming Soon)

Pull the image
docker pull ghcr.io/jsuzanne/sdwan-traffic-generator:latest

Run container
docker run -d
--name sdwan-traffic-gen
--network host
ghcr.io/jsuzanne/sdwan-traffic-generator:latest

text

## 🔧 Post-Installation Configuration

### Configure Network Interface

By default, the script uses `eth0`. To change:

Edit the interfaces file
sudo nano /opt/sdwan-traffic-gen/config/interfaces.txt

Example: Use multiple interfaces
eth0
ens192
ens224

text

Traffic will be randomly distributed across all listed interfaces.

### Customize Traffic Distribution

Edit application weights to match your demo scenario:

sudo nano /opt/sdwan-traffic-gen/config/applications.txt

text

**Format**: `domain|weight|endpoint`

Example for a Microsoft-heavy environment:
Microsoft 365 (40% of traffic)
teams.microsoft.com|150|/api/mt/emea/beta/users/
outlook.office365.com|140|/
onedrive.live.com|100|/

Google Workspace (20% of traffic)
drive.google.com|80|/
gmail.com|70|/

text

**Restart after changes**:
sudo systemctl restart sdwan-traffic-gen

text

### Adjust Request Rate

Edit the main script to change requests per minute:

sudo nano /opt/sdwan-traffic-gen/traffic-generator.sh

Find and modify this line:
SLEEP_BETWEEN_REQUESTS=1 # Default: 60 requests/min

Examples:
SLEEP_BETWEEN_REQUESTS=0.5 # 120 requests/min (busier)
SLEEP_BETWEEN_REQUESTS=2 # 30 requests/min (lighter)
SLEEP_BETWEEN_REQUESTS=0.1 # 600 requests/min (heavy load)

text

## ✅ Verification

### Check Service Status

Service status
sudo systemctl status sdwan-traffic-gen

Live logs
tail -f /var/log/sdwan-traffic-gen/traffic.log

Statistics (after ~50 requests)
cat /var/log/sdwan-traffic-gen/stats.json | jq

Request count
grep -c SUCCESS /var/log/sdwan-traffic-gen/traffic.log

text

### Expected Output

**Logs** (`traffic.log`):
[2025-11-28 17:20:15] [INFO] Starting SD-WAN Traffic Generator - Client: client01
[2025-11-28 17:20:15] [INFO] client01 requesting https://teams.microsoft.com/api/mt/emea/beta/users/ via eth0 (traceid: 1732812015-client01)
[2025-11-28 17:20:16] [INFO] client01 SUCCESS https://teams.microsoft.com/api/mt/emea/beta/users/ - code: 200
[2025-11-28 17:20:17] [INFO] client01 requesting https://drive.google.com/ via eth0 (traceid: 1732812017-client01)

text

**Statistics** (`stats.json`):
{
"timestamp": 1732812100,
"client_id": "client01",
"total_requests": 150,
"requests_by_app": {
"teams": 28,
"outlook": 25,
"google": 20,
"slack": 15,
"zoom": 12
},
"errors_by_app": {}
}

text

## 🔍 Troubleshooting Installation

### Service won't start

Check for errors
sudo journalctl -u sdwan-traffic-gen -n 50 --no-pager

Test manually
sudo /opt/sdwan-traffic-gen/traffic-generator.sh client01

Check permissions
ls -la /opt/sdwan-traffic-gen/
ls -la /var/log/sdwan-traffic-gen/

text

### Configuration file missing

Verify all files exist
ls -la /opt/sdwan-traffic-gen/config/

Should show:
applications.txt
interfaces.txt
user_agents.txt
If missing, copy from repository
sudo cp config/*.txt /opt/sdwan-traffic-gen/config/

text

### Network connectivity issues

Test basic connectivity
curl -I https://google.com

Test specific interface (replace eth0)
curl --interface eth0 -I https://teams.microsoft.com

Check DNS resolution
nslookup teams.microsoft.com

text

### No traffic appearing in logs

Check if service is actually running
ps aux | grep traffic-generator

Restart service
sudo systemctl restart sdwan-traffic-gen

Watch logs in real-time
tail -f /var/log/sdwan-traffic-gen/traffic.log

If still nothing after 10 seconds, check journalctl
sudo journalctl -u sdwan-traffic-gen -f

text

### Interface not found error

List available interfaces
ip link show

Update interfaces.txt with valid interface
echo "eth0" | sudo tee /opt/sdwan-traffic-gen/config/interfaces.txt

Restart
sudo systemctl restart sdwan-traffic-gen

text

## 🔄 Updating

### Update to latest version

cd sdwan-traffic-generator
git pull origin main

Backup current config
sudo cp /opt/sdwan-traffic-gen/config/applications.txt /tmp/applications.txt.bak

Reinstall
sudo ./install.sh

Restore custom config if needed
sudo cp /tmp/applications.txt.bak /opt/sdwan-traffic-gen/config/applications.txt

Restart service
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

## 📞 Getting Help

- **Issues**: https://github.com/jsuzanne/sdwan-traffic-generator/issues
- **Discussions**: https://github.com/jsuzanne/sdwan-traffic-generator/discussions
- **Wiki**: https://github.com/jsuzanne/sdwan-traffic-generator/wiki

---

**Next Steps**: See [USAGE.md](docs/USAGE.md) for daily operations and [CONFIGURATION.md](docs/CONFIGURATION.md) for advanced customization.
