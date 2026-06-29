---
project: porting-automation-tango-tmo
prd_version: v1
valid_from: 2026-06-22
valid_to: null
superseded_by: null
source_format: md
source_file: null
assets_dir: null
---

# Fixed Mobile Convergence - Porting Automation for Tango_TMO

Mobile eSIM numbers are likely going to be leaning towards porting than new numbers. Also to launch in US automation is always mandatory considering the volume and load it can generate on support teams

We need to integrate with the carrier porting API's to automate porting flows for UK and US with Tango and TMO

Both carriers offer porting API's

1. Requirement:
    1. Porting process needs documentary proof and significant portion of those documents overlap with business address document needs.
    2. Utilize the business address similar to get number flow during the porting request flow
    3. Expand the porting flow to all countries from a collection standpoint replacing the ticketing process the admin are directed to today
    4. Porting team/Product Team to review the business address requirements and ensure where there are need for additional items from a porting perspective over and above what is already collected via business address
    5. Therefore in the porting flow the admin first attaches the business address (dependent on country + number type selected) and then is requested other elements to complete the porting requirements
    6. Post the porting collection is complete, starts the porting activity which could either be automated where porting API's are available or ticketing process is triggered is where automated API based porting with carrier is not available
2. Porting requirements:
    1. Tango Mobile eSIM UK: Defined with porting team.
        1. Zoom Mobile UK -_ Tango Porting Workflow.docx (Need update)
        2. [https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0085008](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0085008)
    2. Tango Mobile eSIM US: TBD
