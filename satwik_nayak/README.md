# WHAT IT DOES
It is an automated login script for captive portal of SIT
It uses NetworkManager's dispatcher to run when it detects a portal
You just have to prove your username and password.

# HOW TO RUN IT
## Requirements
Your system must have NetworkManager installed

## Setting up
Copy the 90-login_captive_portal to `/etc/NetworkManager/dispatcher.d/90-login_captive_portal`
and portal-credentials to /etc/NetworkManager/portal-credentials.conf

Open portal-credentials.conf in a text editor like nano and fill out your username and password

## Changing owner and permissions
Run the following command to change the owner to root and modify the permissions

```bash
sudo chown root:root /etc/NetworkManager/dispatcher.d/90-login_captive_portal
sudo chown root:root /etc/NetworkManager/portal-credentials.conf
sudo chmod 755 /etc/NetworkManager/dispatcher.d/90-login_captive_portal
sudo chmod 600 /etc/NetworkManager/portal-credentials.conf
```

# HOW IT WORKS
* When NetworkManager detects a change in network connection it runs all scripts in /etc/NetworkManager/dispacther.d
* It passes the event as a positional argument(2nd) and in the script we check it if its a `connectivity-change`
* NetworkManager also sets a environmental variable during a connectivity-change, we check if this variable `CONNECTIVITY_STATE` equals `PORTAL`
* The script first retrives the SSID and checks if it matches the Target SSID as set in the credentials (LHBC_Student)
* Then it sends a request to `http://nmcheck.gnome.org/check_network_status.txt` whcih replies with the redirection URL ie the captive portal URL
* It then fetches the session id from the portal url and then sends a request to login with the given credentials.

# What I found hard and what i would improve
1. Getting the ssid was way more difficult i imagined it to be since i tried to make it universal i didnt use `iwgetid -r`.
2. Sending notification notify-send was also extremely hard because the script is ran as a background system daemon and cannot directly interact with GUI sessions.
3. First thing I would add is a check if the login succeded or not, currently it sends successfully connected even if it failed due to invalid credentials
4. I would also make a Windows version
5. I would also look for alternatives for notify-send, since not all systems have it 
