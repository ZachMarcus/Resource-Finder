#! /usr/bin/python
 
# Demo to talk to an XBee ZigBee device
# Per Magnusson, 2015-07-28
  
import serial
import serial.tools.list_ports
import time
import requests
import sys
 
ser = serial.Serial('COM15', 9600, timeout=1)
level = 0
thresh = 1000
detected = False

ADDR = '127.0.0.1:5000/api/v1/seats/'

while True:
	try:
		new_level = int(ser.readline().strip())
	except:
		continue

	level = level * 0.8 + new_level * 0.2

	if (level < thresh) and not detected:
		detected = True
		requests.post(ADDR + '0', data={'available': False})
		print 'occupied', level
	if (level > thresh) and detected:
		detected = False
		requests.post(ADDR + '0', data={'available': True})