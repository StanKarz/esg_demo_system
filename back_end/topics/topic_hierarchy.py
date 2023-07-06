import json


def convert_to_hierarchy(data):
    children = []
    for key, value in data.items():
        child = {"name": key}
        subchildren = convert_to_hierarchy(value)
        if subchildren:
            child["children"] = subchildren
        else:
            child["value"] = 1
        children.append(child)
    return children


# Read JSON data from file
with open('back_end/topics/sunburst/esg_topic_taxonomy.json', 'r') as file:
    data = json.load(file)

# Convert the data into hierarchical format
hierarchical_data = convert_to_hierarchy(data)

# Wrap the hierarchical data into a root object
root_object = {
    "name": "root",
    "children": hierarchical_data
}

# Wrap the hierarchical data inside an object
wrapped_hierarchy = {
    "name": "ESG Topics",
    "children": hierarchical_data
}

# Specify the directory and file name where you want to save the hierarchical data
# replace with the desired directory
output_directory = 'back_end/topics/sunburst'
output_filename = 'hierarchical_data.json'
output_path = f"{output_directory}/{output_filename}"

# Save the hierarchical data to a new JSON file
with open(output_path, 'w') as file:
    json.dump(wrapped_hierarchy, file)
