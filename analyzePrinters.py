#!/usr/bin/python3
import csv
import requests

class printerStatus(object):
	def __init__(self, printerListFile):
		print()
		with open(printerListFile, 'r') as fil:
			reader = csv.reader(fil)
			self.printerList = list(list(entry) for entry in csv.reader(fil, delimiter=','))

	def query(self, ipAddress):
		request = requests.get(ipAddress, verify=False)
		print(request.status_code)
		print(request.url)
		print(request.text)



mine = printerStatus('printerList.csv')
print(mine.printerList)

mine.query('http://' + mine.printerList[1][0])
