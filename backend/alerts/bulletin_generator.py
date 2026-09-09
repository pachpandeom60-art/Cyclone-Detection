"""
CAP (Common Alerting Protocol v1.2) Emergency Bulletin & Evacuation Advisory Generator.
"""

import time
import logging
from typing import Dict, Any, List
from xml.etree import ElementTree as ET

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("BulletinGenerator")


class BulletinGenerator:
    """
    Generates CAP XML and JSON emergency advisories for disaster management authorities.
    """

    def generate_bulletins(
        self,
        storm_name: str = "CYCLONE AL-01",
        lat: float = 15.5,
        lon: float = 87.2,
        wind_kts: float = 90.0,
        pressure_hpa: float = 955.0,
        landfall_loc: str = "Odisha-West Bengal Coast"
    ) -> List[Dict[str, Any]]:
        """
        Generates array of operational CAP advisories and warnings based on meteorological severity.
        """
        timestamp = time.strftime("%Y-%m-%dT%H:%M:%S+05:30", time.localtime())

        # Determine severity level
        if wind_kts >= 90:
            severity = "Extreme"
            urgency = "Immediate"
            port_signal = "GREAT DANGER SIGNAL NO. X"
            surge_m = "4.5 to 6.0 meters"
        elif wind_kts >= 64:
            severity = "Severe"
            urgency = "Immediate"
            port_signal = "DANGER SIGNAL NO. VIII"
            surge_m = "3.0 to 4.5 meters"
        elif wind_kts >= 34:
            severity = "Moderate"
            urgency = "Expected"
            port_signal = "LOCAL WARNING SIGNAL NO. IV"
            surge_m = "1.5 to 2.5 meters"
        else:
            severity = "Minor"
            urgency = "Future"
            port_signal = "DISTANT CAUTIONARY SIGNAL NO. II"
            surge_m = "0.5 to 1.0 meters"

        bulletins = [
          {
            "id": f"CAP-EVAC-{int(time.time())}",
            "type": "COASTAL EVACUATION ADVISORY",
            "identifier": f"IMD/RSMC/{storm_name.replace(' ', '_')}/ADV-01",
            "status": "Actual",
            "msgType": "Alert",
            "severity": severity,
            "urgency": urgency,
            "headline": f"MANDATORY EVACUATION NOTICE FOR COASTAL SECTORS NEAR {landfall_loc.upper()}",
            "description": f"Extremely severe tropical cyclone {storm_name} centered near {lat}°N, {lon}°E with sustained winds of {wind_kts} kts ({int(wind_kts*1.852)} km/h). Mandatory 5km coastal strip evacuation ordered.",
            "instruction": "Move to safe concrete cyclone shelters immediately. Stock 72 hours of drinking water, dry rations, emergency light, and medical kit.",
            "targetArea": landfall_loc,
            "timestamp": timestamp
          },
          {
            "id": f"CAP-MAR-{int(time.time())+1}",
            "type": "MARITIME PORT WARNING BULLETIN",
            "identifier": f"MARITIME/IMD/{storm_name.replace(' ', '_')}/SIG-10",
            "status": "Actual",
            "msgType": "Update",
            "severity": severity,
            "urgency": "Immediate",
            "headline": f"MARITIME WARNING: {port_signal} HOISTED AT ALL MAJOR COASTAL PORTS",
            "description": f"Fishermen are strictly advised not to venture into deep sea areas over Central & North Bay of Bengal. Ships at anchorage must prepare for heavy sea swell.",
            "instruction": "All fishing trawlers must remain harbored. Commercial port operations suspended.",
            "targetArea": "North & Central Bay of Bengal Ports",
            "timestamp": timestamp
          },
          {
            "id": f"CAP-SURGE-{int(time.time())+2}",
            "type": "STORM SURGE INUNDATION FORECAST",
            "identifier": f"SURGE/INCOIS/{storm_name.replace(' ', '_')}/SURGE-03",
            "status": "Actual",
            "msgType": "Alert",
            "severity": severity,
            "urgency": urgency,
            "headline": f"STORM SURGE HEIGHT OF {surge_m.upper()} PREDICTED AT LANDFALL",
            "description": f"Astronomical high tide coupled with storm pressure deficit ({1013-pressure_hpa:.1f} hPa) will cause coastal inundation extending 2.5 km inland.",
            "instruction": "Evacuate low-lying estuaries, saline embankments, and mud houses near shoreline.",
            "targetArea": f"Low-lying coastal districts of {landfall_loc}",
            "timestamp": timestamp
          }
        ]

        return bulletins

    def export_cap_xml(self, bulletin: Dict[str, Any]) -> str:
        """
        Exports bulletin dict to standard OASIS CAP v1.2 XML document string.
        """
        alert = ET.Element("alert", xmlns="urn:oasis:names:tc:emergency:cap:1.2")
        ET.SubElement(alert, "identifier").text = bulletin["identifier"]
        ET.SubElement(alert, "sender").text = "rsMC-cyclone@imd.gov.in"
        ET.SubElement(alert, "sent").text = bulletin["timestamp"]
        ET.SubElement(alert, "status").text = bulletin["status"]
        ET.SubElement(alert, "msgType").text = bulletin["msgType"]
        ET.SubElement(alert, "scope").text = "Public"

        info = ET.SubElement(alert, "info")
        ET.SubElement(info, "category").text = "Met"
        ET.SubElement(info, "event").text = bulletin["type"]
        ET.SubElement(info, "urgency").text = bulletin["urgency"]
        ET.SubElement(info, "severity").text = bulletin["severity"]
        ET.SubElement(info, "certainty").text = "Observed"
        ET.SubElement(info, "headline").text = bulletin["headline"]
        ET.SubElement(info, "description").text = bulletin["description"]
        ET.SubElement(info, "instruction").text = bulletin["instruction"]

        area = ET.SubElement(info, "area")
        ET.SubElement(area, "areaDesc").text = bulletin["targetArea"]

        return ET.tostring(alert, encoding="utf-8").decode("utf-8")


if __name__ == "__main__":
    gen = BulletinGenerator()
    buls = gen.generate_bulletins()
    print(f"Generated {len(buls)} bulletins.")
    xml_sample = gen.export_cap_xml(buls[0])
    print("CAP XML Sample:\n", xml_sample[:250])
