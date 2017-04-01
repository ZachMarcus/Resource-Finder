#!/usr/bin/python3
import csv
import requests


class individualPrinter(object):
	def __init__(self, ip):
		self.ipAddress = ip
		self.inkStatus = None
		self.inkColor = None
		self.paperSupply = None

		self.indexResponse = requests.get('http://' + str(self.ipAddress), verify=False)
		self.deviceResponse = requests.get('http://' + str(self.ipAddress) + '/hp/device/DeviceInformation/View',verify=False)

		if self.indexResponse.status_code is not 200:
			print('Request Failed: ' + str(self.indexResponse.status_code) + ' from ' + self.indexResponse.url)
		if self.deviceResponse.status_code is not 200:
			print('Request Failed: ' + str(self.deviceResponse.status_code) + ' from ' + self.deviceResponse.url)

		self.parseResponse()

	def parseResponse(self):
		print('hi')



class printerStatus(object):
	def __init__(self, printerListFile):
		#print()
		self.printerDicts = {}
		self.printerInfoDict = {}
		with open(printerListFile, 'r') as fil:
			dictReader = csv.DictReader(fil)
			for row in dictReader:
				key = row.pop('IP Address')
				if key in self.printerDicts.keys():
					print('IP address appears twice in csv')
					pass
				self.printerDicts[key] = row
			#self.printerList = list(list(entry) for entry in csv.reader(fil, delimiter=','))
			

	def query(self):
		count = 0
		limit = 2
		for key in self.printerDicts.keys():
			count = count + 1
			if count >= limit:
				return
			print(key)
			printer = individualPrinter(key)
			self.printerInfoDict[key] = printer
		#print(self.printerDicts.keys()[0])
		#for i in range(1, len(self.printerList)):

		#for i in range(1, 2):
			#printer = individualPrinter(self.printerList[i][0])
		#	self.printerInfoList.append(printer)




mine = printerStatus('../data/printerList.csv')
#print(mine.printerList)

mine.query()




