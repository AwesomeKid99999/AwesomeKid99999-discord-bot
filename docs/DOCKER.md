# Docker Deployment Guide

This guide covers deploying the bot using Docker, with specific instructions for Synology DSM and general platforms.

## Prerequisites

- Docker installed on your system
- Docker Compose (optional, but recommended)
- A MySQL database (remote or local)
  - For cloud hosting: [Aiven](https://aiven.io/), [PlanetScale](https://planetscale.com/), [AWS RDS](https://aws.amazon.com/rds/), etc.
  - For local hosting: MySQL 8.0+ installation or Docker container

## Quick Start

### Option 1: Using Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/AwesomeKid99999/AwesomeKid99999-discord-bot.git
   cd AwesomeKid99999-discord-bot
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   nano .env  # or use your preferred editor
   ```
   Fill in all required values (Discord tokens, database credentials, etc.)

3. **Build and run**
   ```bash
   docker-compose up -d
   ```

4. **View logs**
   ```bash
   docker-compose logs -f bot
   ```

### Option 2: Using Docker CLI

1. **Build the image**
   ```bash
   docker build -t awesomebot99999 .
   ```

2. **Run the container**
   ```bash
   docker run -d \
     --name awesomebot99999 \
     --restart unless-stopped \
     --env-file .env \
     awesomebot99999
   ```

3. **View logs**
   ```bash
   docker logs -f awesomebot99999
   ```

## Synology DSM Deployment

Synology DSM provides a user-friendly Docker GUI through Container Manager (formerly Docker package).

### Method 1: Container Manager GUI

1. **Install Container Manager**
   - Open Package Center
   - Search for "Container Manager"
   - Install the package

2. **Upload the project**
   - Upload the entire bot folder to your Synology NAS (e.g., `/docker/awesomebot99999/`)
   - SSH into your NAS or use File Station + Text Editor

3. **Configure .env file**
   - Navigate to the bot folder
   - Copy `.env.example` to `.env`
   - Edit `.env` with your credentials

4. **Build and deploy using Project**
   - Open Container Manager
   - Go to "Project" tab
   - Click "Create"
   - Select "Create docker-compose.yml" or use existing
   - Browse to your bot folder
   - Set project name (e.g., "awesomebot99999")
   - Click "Next" → "Done"

5. **Start the bot**
   - The project will automatically build and start
   - Check the "Container" tab to see your running bot
   - Click on the container to view logs

### Method 2: SSH Terminal (Advanced)

1. **Enable SSH** (DSM Settings → Terminal & SNMP)

2. **Connect via SSH**
   ```bash
   ssh admin@your-nas-ip
   ```

3. **Navigate to project folder**
   ```bash
   cd /volume1/docker/awesomebot99999
   ```

4. **Run with Docker Compose**
   ```bash
   sudo docker-compose up -d
   ```

### Synology Tips

- **Persistent Storage**: Projects in Container Manager use your NAS storage, so logs and data persist across restarts
- **Auto-start**: Set the container to auto-start in Container Manager settings
- **Updates**: To update, pull new code, rebuild with `docker-compose up -d --build`
- **Resource Limits**: Set CPU/memory limits in Container Manager → Edit Container → Resource Limitation
- **Notifications**: Configure DSM notifications for container status changes

## Database Options

You have three options for the database:

### Option 1: Remote Database (Recommended for Production)

Set these in your `.env`:
```env
DATABASE_HOST=your-cloud-db-host.example.com
DATABASE_PORT=3306
DATABASE_NAME=discord_bot
DATABASE_USER=your_username
DATABASE_PASSWORD=your_password
```

**Advantages:**
- Automatic backups
- High availability
- Professional monitoring
- No local maintenance

**Popular providers:** Aiven, PlanetScale, AWS RDS, DigitalOcean Managed Database

### Option 2: Local MySQL Installation

If you have MySQL already installed on your host machine:

**Configuration:**
```env
# Windows/Mac: Use host.docker.internal
DATABASE_HOST=host.docker.internal
DATABASE_PORT=3306
DATABASE_NAME=discord_bot
DATABASE_USER=your_username
DATABASE_PASSWORD=your_password
```

**Linux:** Add `--add-host=host.docker.internal:host-gateway` to docker run, or in docker-compose.yml:
```yaml
services:
  bot:
    build: .
    extra_hosts:
      - "host.docker.internal:host-gateway"
```

**Setup steps:**
1. Install MySQL from [mysql.com/downloads](https://dev.mysql.com/downloads/mysql/)
2. Create database: `CREATE DATABASE discord_bot;`
3. Create user and grant permissions:
   ```sql
   CREATE USER 'botuser'@'%' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON discord_bot.* TO 'botuser'@'%';
   FLUSH PRIVILEGES;
   ```
4. Ensure MySQL accepts connections from Docker:
   - Edit `my.cnf` or `my.ini`
   - Set `bind-address = 0.0.0.0` (or at least allow 172.17.0.0/16 Docker network)
   - Restart MySQL service

**Advantages:**
- Use existing MySQL installation
- Manage with familiar tools
- No additional Docker container needed

### Option 3: Docker MySQL Container

If you prefer a local database in Docker, uncomment the `db` service in `docker-compose.yml`:

```yaml
services:
  bot:
    # ... existing config
    depends_on:
      - db

  db:
    image: mysql:8.0
    container_name: awesomebot-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${DATABASE_PASSWORD}
      MYSQL_DATABASE: ${DATABASE_NAME}
      MYSQL_USER: ${DATABASE_USER}
      MYSQL_PASSWORD: ${DATABASE_PASSWORD}
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql

volumes:
  mysql-data:
```

Then update `.env`:
```env
DATABASE_HOST=db
DATABASE_PORT=3306
```

**Advantages:**
- All-in-one Docker setup
- Isolated from host system
- Easy to tear down and recreate
- Consistent across different environments

## Container Management

### Update the bot
```bash
git pull
docker-compose up -d --build
```

### Stop the bot
```bash
docker-compose down
```

### Restart the bot
```bash
docker-compose restart
```

### View logs
```bash
docker-compose logs -f bot
```

### Access container shell
```bash
docker exec -it awesomebot99999 sh
```

## Maintenance Commands

### Sync Database (Create/Update Tables)

When you first deploy or after updating models, sync the database:

```bash
# Using docker-compose
docker-compose exec bot node src/syncdb.js

# Using docker run
docker exec awesomebot99999 node src/syncdb.js
```

**When to run:**
- First deployment (initial setup)
- After adding new models or modifying existing ones
- After pulling updates that change database schema

### Deploy/Refresh Slash Commands

After adding new commands or updating existing ones, refresh Discord's command registry:

```bash
# Using docker-compose
docker-compose exec bot node src/deploy-commands.js

# Using docker run
docker exec awesomebot99999 node src/deploy-commands.js
```

**When to run:**
- First deployment (register all commands)
- After adding new commands
- After modifying command options/descriptions
- If commands aren't showing up in Discord

### Running Commands on Synology DSM

#### Method 1: Container Manager GUI
1. Open Container Manager
2. Go to "Container" tab
3. Select your bot container
4. Click "Details" → "Terminal" tab
5. Click "Create" to open a shell
6. Run commands directly:
   ```sh
   node src/syncdb.js
   node src/deploy-commands.js
   ```

#### Method 2: SSH Terminal
```bash
# Connect to your NAS
ssh admin@your-nas-ip

# Run maintenance commands
sudo docker exec awesomebot99999 node src/syncdb.js
sudo docker exec awesomebot99999 node src/deploy-commands.js
```

### Combined First-Time Setup

For initial deployment, run both commands in sequence:

```bash
# Sync database first
docker-compose exec bot node src/syncdb.js

# Then deploy commands
docker-compose exec bot node src/deploy-commands.js

# Restart the bot to ensure everything loads properly
docker-compose restart bot
```

### Automated Deployment Script

Create a `deploy.sh` script for easy updates:

```bash
#!/bin/bash
echo "Pulling latest changes..."
git pull

echo "Rebuilding container..."
docker-compose up -d --build

echo "Waiting for container to start..."
sleep 5

echo "Syncing database..."
docker-compose exec bot node src/syncdb.js

echo "Deploying commands..."
docker-compose exec bot node src/deploy-commands.js

echo "Viewing logs..."
docker-compose logs -f bot
```

Make it executable:
```bash
chmod +x deploy.sh
```

Run it:
```bash
./deploy.sh
```

## Troubleshooting

### Bot won't start
1. Check logs: `docker-compose logs bot`
2. Verify `.env` file exists and has correct values
3. Ensure database is accessible
4. Check Discord token is valid

### Database connection errors
1. Verify `DATABASE_HOST` is correct
2. Check firewall/network allows connection to database port
3. Confirm database credentials are correct
4. Test connection: `docker exec -it awesomebot99999 sh` then try connecting with a MySQL client

### Container keeps restarting
1. Check logs for error messages
2. Verify `package.json` has correct start script
3. Ensure all required environment variables are set
4. Check Node.js version compatibility

### Synology-specific issues
- **Permission denied**: Ensure the docker folder has correct permissions
- **Port conflicts**: Check if port 3306 is already in use (if using local MySQL)
- **Memory issues**: Increase container memory limit in Container Manager
- **Storage full**: Check available space on your NAS

## Security Best Practices

1. **Never commit `.env` file** - It's in `.gitignore` for a reason
2. **Use strong database passwords** - Generate random passwords
3. **Limit container resources** - Set CPU/memory limits
4. **Keep Docker updated** - Regular updates for security patches
5. **Use read-only file systems** where possible
6. **Regular backups** - Back up your database and `.env` file

## Performance Tips

- **Resource allocation**: Assign appropriate CPU/memory based on server size
- **Restart policy**: Use `unless-stopped` to survive NAS reboots
- **Log rotation**: Implement log rotation to prevent disk space issues
- **Monitoring**: Use DSM's Resource Monitor to track container performance

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Synology Container Manager Guide](https://kb.synology.com/en-us/DSM/help/ContainerManager/docker_desc)
- [Bot Setup Guide](./docs/SETUPGUIDE.md)
- [Commands Reference](./docs/COMMANDS.md)

## Support

If you encounter issues not covered in this guide:
1. Check the [GitHub Issues](https://github.com/AwesomeKid99999/AwesomeKid99999-discord-bot/issues)
2. Review the [Setup Guide](./docs/SETUPGUIDE.md)
3. Open a new issue with:
   - Your deployment method (Docker Compose/CLI, Synology DSM version, etc.)
   - Error messages from logs
   - Steps to reproduce the issue
