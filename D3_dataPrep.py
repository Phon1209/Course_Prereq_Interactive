# The parser for Quacs format to D3 input format.
# Completely written by Jianye Peng
#This is version 2 for HW5 of Interactive Visualziation at RPI, Spring 2024

#{
#   "name":"csci-1200",
#   "prereqs":["csci-1100","math-1100"],
#   "department": "csci",
#   "displayName": "Data Structure"
# }

import json
import sys
import os


DEPARTMENT_LIST = ['arch', 'chem', 'csci', 'engr', 'ecse', 'mgmt', 'math', 'phil', 'psyc', 'stsh', 'stss', 'biol', 'arts', 'astr', 'bcbp', 'bmed', 'chme', 'civl', 'comm', 'dses', 'erth', 'econ', 'epow', 'enve', 'lang', 'mtle', 'matp', 'phys', 'writ', 'isci', 'lght', 'ihss', 'itec', 'mane', 'cogs', 'isye', 'itws', 'gsas', 'stso', 'inqr']

def sep_list(department,data,output_file = "sep_list"):
    with open(output_file,'w') as output:
        for i in data:
            if data[i]["department"] == department:
                json.dump()
    os.rename("sep_list",department+"_list")
    return


if __name__ == "__main__":
    with open('prereq_graph.json', 'r') as file:
        data = json.load(file)
        connected_node = []
        # department_list = []

        for i in data:
            if data[i]["prereqs"] != []: #course has a prereq
                connected_node.append(i.lower())
            for j in data[i]["prereqs"]: #course is a prereq of other
                connected_node.append(j.lower())
        connected_node = list(set(connected_node)) #de-dups

        with open('HED_formatted.json','w') as output_file:
            output = []
            for i in data:
                name = i.lower()
                if name in connected_node:
                    department = name[:4]
                    prereqs = [j.lower() for j in data[i]["prereqs"]]
                    displayName = data[i]["title"]
                    item = {"name": name,
                            "prereqs":prereqs,
                            "department":department,
                            "displayName":displayName  
                    } 
                    output.append(item)

            json.dump(output,output_file,indent=4)

        for i in DEPARTMENT_LIST:
            with open(i+'_list.json','w') as department_list_file:
                temp = []
                for j in output:
                    if j["department"] == i:
                        temp.append(j)
                json.dump(temp,department_list_file,indent=4)
    print('Processing Done.')










    

