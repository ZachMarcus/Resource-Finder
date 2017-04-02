#!/usr/bin/python3

import multiprocessing
import subprocess
import os
import requests
#import bs4.BeautifulSoup
from bs4 import BeautifulSoup

def pinger( job_q, results_q ):
    DEVNULL = open(os.devnull,'w')
    while True:
        ip = job_q.get()
        if ip is None: break

        try:
            subprocess.check_call(['ping','-c1',ip],
                                  stdout=DEVNULL)
            results_q.put(ip)
        except:
            pass

def getAllPrintersToFile():
    pool_size = 255

    jobs = multiprocessing.Queue()
    results = multiprocessing.Queue()

    pool = [ multiprocessing.Process(target=pinger, args=(jobs,results))
             for i in range(pool_size) ]

    for p in pool:
        p.start()

    for i in range(1,255):
        jobs.put('10.30.10.{0}'.format(i))

    for p in pool:
        jobs.put(None)

    for p in pool:
        p.join()


    ipAddresses = []

    while not results.empty():
        ip = results.get()
        #print(ip)
        ipAddresses.append(ip)

    if not os.path.exists("./search"):
        os.makedirs("./search")
    for ip in ipAddresses:
        ipBase = "http://"
        #print(ipBase + ip)
        try:
            response = requests.get(ipBase + ip + "/hp/device/DeviceInformation/View", verify=False, timeout=10.00)
            if response.status_code == 200:
                with open("./search/" + ip + "Device.html", "w+") as fil:
                    fil.write(response.text)
        except Exception as e:
            print(e)



def getAllNames(mypath):
    dic = dict()

    allFiles = [f for f in os.listdir(mypath) if os.path.isfile(os.path.join(mypath, f))]
    for f in allFiles:
        #print(mypath + f)
        with open(mypath + f, "rb") as fil:
            theSoup = BeautifulSoup(fil, "lxml")
            temp_dict = dict()
            temp_dict["IP Address"] = f.replace("Device.html", "")
            temp_dict["DeviceName"] = theSoup.find("p", {"id": "DeviceName"}).string
            temp_dict["DeviceLocation"] = theSoup.find("p", {"id": "DeviceLocation"}).string
            temp_dict["ProductName"] = theSoup.find("p", {"id": "ProductName"}).string
            dic[f.replace("Device.html", "")] = temp_dict
    #print(dic)

    with open("PrinterList3.json", "w+") as fil:
        for key in dic.keys():
        #    print(key + ": " + str(dic[key]))
            fil.write(str(dic[key]).replace("'", "\"").replace("None", "\"None\""))
            fil.write("\n")




#getAllPrintersToFile()
getAllNames("./search/")




