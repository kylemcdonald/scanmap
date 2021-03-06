import json
import config
import requests

helicopters_config = {}
for loc, conf in config.LOCATIONS.items():
    if conf.get('HELICOPTERS'):
        items = json.load(open(conf['HELICOPTERS']))
        helicopters_config[loc] = items
        helicopters_config[loc]['filter'] = set(items['tails'].keys())

def get_helicopter_locations(location):
    if location not in helicopters_config:
        return []
    url = 'https://data-live.flightradar24.com/zones/fcgi/feed.js'
    params = { 'bounds': helicopters_config[location]['bounds'] }
    headers = { 'User-Agent': 'Mozilla/5.0' }
    resp = requests.get(url, params=params, headers=headers)
    data = resp.json()
    results = []
    for key, value in data.items():
        if not isinstance(value, list):
            continue
        lat, lng, tail = value[1], value[2], value[16]
        if tail not in helicopters_config[location]['filter']:
            continue
        meta = helicopters_config[location]['tails'][tail]
        results.append({
            'tail': tail,
            'lat': lat,
            'lng': lng,
            'url': meta['img_url'],
            'owner': meta['owner']
        })
    return results