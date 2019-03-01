import boto3
from botocore.client import Config
import StringIO
import zipfile
import mimetypes

def lambda_handler(event, context):

    location = {
      "bucketName": 'portfoliobuild.sidsalunke.info',
      "objectKey": 'portfoliobuild.zip'
      }

    s3 = boto3.resource('s3', config=Config(signature_version='s3v4'))
    
    portfolio_bucket = s3.Bucket('portfolio.sidsalunke.info')
    build_bucket = s3.Bucket(location["bucketName"])
    
    portfolio_zip = StringIO.StringIO()
    build_bucket.download_fileobj(location["objectKey"], portfolio_zip)
    
    with zipfile.ZipFile(portfolio_zip) as myzip:
        for nm in myzip.namelist():
            obj = myzip.open(nm)
            portfolio_bucket.upload_fileobj(obj, nm)
            portfolio_bucket.Object(nm).Acl().put(ACL='public-read')
    print "Job done!"
    return 'Hello from Lambda'
