
from bs4 import BeautifulSoup
from flask import Flask, request, jsonify
from time import sleep

#import csv
import requests
import threading
import json

from datetime import datetime
from io import StringIO


class individualPrinter(object):
	"""
	class to store the information from a single printer
	it's not much more than a way to structure our data
	"""
	def __init__(self, ip):
		self.ipAddress = ip
		self.inkStatus = None
		self.paperSupply = None
		self.productName = None
		self.deviceName = None
		self.deviceLocation = None
		self.numRecentTickets = None

		try:
			self.indexResponse = requests.get('http://' + str(self.ipAddress), verify=False, timeout=3.00)
			self.deviceResponse = requests.get('http://' + str(self.ipAddress) + '/hp/device/DeviceInformation/View',verify=False, timeout=3.00)
			
			noAuthenticatedPrinters = [
			"10.30.10.104",
			"10.30.10.113",
			"10.30.10.122",
			"10.30.10.225",
			"10.30.10.32",
			"10.30.10.85",
			"10.30.10.93"]
			if self.ipAddress in noAuthenticatedPrinters:
				self.jobResponse = requests.get("http://" + str(self.ipAddress) + "/hp/device/JobLogReport/Index", verify=False, timeout=3.00)
				if self.jobResponse.status_code is not 200:
					print('Request Failed: ' + str(self.jobResponse.status_code) + ' from ' + self.jobResponse.url)
			
			if self.indexResponse.status_code is not 200:
					print('Request Failed: ' + str(self.indexResponse.status_code) + ' from ' + self.indexResponse.url)
			if self.deviceResponse.status_code is not 200:
				print('Request Failed: ' + str(self.deviceResponse.status_code) + ' from ' + self.deviceResponse.url)
			else:
				print("Request Succeeded")

			self.parseResponse()
		except:
			pass

	"""
	\todo add extra job log status checking
	"""
	def parseResponse(self):
		#print('hi')
		indexSoup = BeautifulSoup(self.indexResponse.text, "lxml")
		self.inkStatus = str(indexSoup.find("span", {"id": "SupplyPLR0"})).split(">")[1].split("%")[0]
		deviceSoup = BeautifulSoup(self.deviceResponse.text, "lxml")
		self.productName = deviceSoup.find("p", {"id": "ProductName"}).string
		self.deviceName = deviceSoup.find("p", {"id": "DeviceName"}).string
		self.deviceLocation = deviceSoup.find("p", {"id": "DeviceLocation"}).string
		self.inkStatus = int(str(indexSoup.find("span", {"id": "SupplyPLR0"})).split(">")[1].split("%")[0])
		isFull = None
		sheetCapacity = None
		totalCount = 0

		table = str(indexSoup.find("table", {"id": "MediaTable"}).tbody)
		for entry in table.split("span class="):
			if "status" in entry:
				isFull = "status-full" in entry
				sheetCapacity = entry.split("td")[2].split(">")[-1][:-2]
				if isFull and sheetCapacity:
					totalCount = totalCount + int(sheetCapacity.split(" ")[0])
		
		self.paperSupply = totalCount
		#print(self.inkStatus, self.paperSupply)


		noAuthenticatedPrinters = [
		"10.30.10.104",
		"10.30.10.113",
		"10.30.10.122",
		"10.30.10.225",
		"10.30.10.32",
		"10.30.10.85",
		"10.30.10.93"]

		if self.ipAddress in noAuthenticatedPrinters:

			jobSoup = BeautifulSoup(self.jobResponse.text, "lxml")
			name = "JobLogName_"
			user = "JobLogUser_"
			status = "JobLogStatus_"
			date = "JobLogData_"
			for line in self.jobResponse.text:
				if "PrintJobTicket" in line:
					print(line)
			numTickets = self.jobResponse.text.count('PrintJobTicket')
			if numTickets == 0:
				self.numRecentTickets = None
			numRecentTickets = 0
			for i in range(0, numTickets):
				time = jobSoup.find("td", {"id": date + str(i)}).string
				if len(time) < 22:
					print("bleh")
					time = time.split(" ")[0] + " 0" + time.split(" ")[1] + " " + time.split(" ")[2]
				print(int(datetime.strptime(time, "%m/%d/%Y %I:%M:%S %p").now().strftime("%s")))
				print(int(datetime.now().strftime("%s")))
				if True or int(datetime.strptime(time, "%m/%d/%Y %I:%M:%S %p").now().strftime("%s")) * 1000 + 1800 > int(datetime.now().strftime("%s")):
					self.numRecentTickets = numRecentTickets + 1




class printerStatus(object):
	"""
	A class to store the information from all printers on campus
	not much more than a dictionary of individual printers
	And a function to go through the list and update our information
	"""
	def __init__(self, printerListFile):
		self.printerDicts = {}
		self.printerInfoDict = {}
		with open(printerListFile, 'r') as fil:
			red = fil.read()
			#print(red)
			red = red.replace('printerList = [', '{"printerList":[') + "}"
			io = StringIO(red)

			data = json.load(io)["printerList"]
			#print(data)
			for item in data:
				self.printerDicts[item["IPAddress"]] = item
			


	def query(self):
		for key in self.printerDicts.keys():
			#print(key)
			printer = individualPrinter(key)
			self.printerInfoDict[key] = printer






def worker():
	"""
	An extra worker to do all the printer data collection
	Intended to be used as a separate thread
	"""
	while(True):
		allPrinterStatuses = printerStatus("static/data/PrinterList3.json")
		allPrinterStatuses.query()
		sleep(60)


class Seat(object):
	"""
	class to store the information from a single printer
	it's not much more than a way to structure our data
	"""
	def __init__(self, seatID):
		self.seatID = seatID
		self.available = False


app = Flask(__name__, static_url_path="")
allPrinterStatuses = printerStatus("static/data/PrinterList3.json")
allPrinterStatuses.query()

seats = []
seats.append(Seat(0))
seats.append(Seat(1))
seats.append(Seat(2))


@app.route("/")
def run_app():
	return "Hello, world"


@app.route("/api/v1/printers", methods=['GET'])
def get_printers():
	printers = {}
	for key in allPrinterStatuses.printerInfoDict:
		printers[key] ={
	'deviceName': allPrinterStatuses.printerInfoDict[key].deviceName,
	'inkStatus': allPrinterStatuses.printerInfoDict[key].inkStatus,
	'productName': allPrinterStatuses.printerInfoDict[key].productName,
	'deviceLocation': allPrinterStatuses.printerInfoDict[key].deviceLocation,
	'paperSupply': allPrinterStatuses.printerInfoDict[key].paperSupply,
	}
	return jsonify({'printers': printers})


@app.route("/api/v1/seats/<int:seat_id>", methods=['POST'])
def post_seat(seat_id):
        print(request.json)
        seats[seat_id].available = request.json['available']
        return 'Done', 201
			

@app.route("/api/v1/seats", methods=['GET'])
def get_seats():
	seat_json = []
	for seat in seats:
		seat_json.append({
	'seatID': seat.seatID,
	'available': seat.available
	})
	return jsonify({'seats': seat_json})


@app.route("/<path:path>")
def status_file(path):
	return app.send_static_file(path)


threads = []
t = threading.Thread(target=worker)
t.start()
