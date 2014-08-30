from flask import Flask
from flask import render_template
import httplib
import urllib
import json
from pprint import pprint

app = Flask(__name__)
images = []

# Route to render the example guide 
@app.route("/")
def index():
    return render_template("index.html", images=images)
    
# Route to retrieve 5 thumbnails based on an offset   
@app.route("/small_images/<offset>")
def small_images(offset=0):
    offset = int(offset)
    start = offset*5
    end = min(offset*5+5, len(images)-1)
    return json.dumps(images[start:end])
    
# Seeds the app: Retrieve the sample guide from snapguide.com and store it in memory for now
def seed():
    conn = httplib.HTTPConnection("snapguide.com", port=80)
    headers = {"Content-type":"application/x-www-form-urlencoded","Accept":"text/plain"}
    conn.request("GET", "/api/v1/guide/b995492d5e7943e3b2757a88fe3ef7c6")    
    response = conn.getresponse()
    data = response.read()
    json_data = json.loads(data)
    
    # Some preprocessing before we store it in memory: we only care about the image urls
    # of the three various sizes
    for i in range(1, len(json_data["guide"]["items"]), 2):
        media_uuid = json_data["guide"]["items"][i]["content"]["media_item_uuid"]
        image_json = json_data["guide"]["media"][media_uuid]
        if ".jpg" in image_json["url"]:
            image_json["url_medium"] = image_json["url"].replace("original.jpg", "300x294_ac.jpg")
            image_json["url_small"] = image_json["url"].replace("original.jpg", "60x60_ac.jpg") 
            images.append(image_json)
          
    print "Finished seeding!"
    
seed()

if __name__ == "__main__":
    app.run()

