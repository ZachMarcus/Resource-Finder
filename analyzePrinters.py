import csv


class printerStatus(object):
	def __init__(self, printerListFile):
		print()
		with open(printerListFile, 'rb') as fil:
			reader = csv.reader(fil)
			self.printerList = list(list(entry) for entry in csv.reader(fil, delimiter=','))


mine = printerStatus('printerList.csv')
print(mine.printerList)

