@echo off
ssh -o StrictHostKeyChecking=yes -o UserKnownHostsFile=~/.ssh/known_hosts root@178.128.127.161 "uname -a; docker --version; docker compose version; ls /opt/ 2>/dev/null; echo DONE_CHECK"
