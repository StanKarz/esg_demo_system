# from anytree import Node, RenderTree
# import json


# # Function to read JSONL file
# def read_jsonl(input_path: str) -> list:
#     """
#     Read a .jsonl file and return the data.

#     :param input_path: The path to the .jsonl file.
#     :return: The data from the .jsonl file.
#     """
#     data = []
#     with open(input_path, 'r', encoding='utf-8') as json_file:
#         for line in json_file:
#             data.append(json.loads(line))
#     return data


# def build_tree(data: list) -> dict:
#     """
#     Build a tree structure from the list of dictionaries.

#     :param data: A list of lists where each sublist contains a dictionary with node information.
#     :return: A dictionary mapping node id to node object.
#     """
#     id_to_node = {}

#     # First, create nodes
#     for sublist in data:
#         for node_dict in sublist:
#             node_id = node_dict['self_id']
#             node_text = node_dict.get('text_str', "")[:100]
            
#             # Skip nodes with empty "text_str" unless they are the root node
#             if node_id != 'r0' and node_text == "":
#                 print(f"Skipping node {node_id} because it has an empty 'text_str'")
#                 continue
            
#             id_to_node[node_id] = Node(node_id, parent=None, text_str=node_text)

#     # Second, link nodes to their parents
#     for sublist in data:
#         for node_dict in sublist:
#             node_id = node_dict['self_id']
#             parent_id = node_dict['parent_id']

#             # Skip if the node or its parent were skipped earlier
#             if node_id not in id_to_node:
#                 print(f"Skipping node {node_id} because it was not included in the first pass")
#                 continue
#             if parent_id and parent_id not in id_to_node:
#                 print(f"Skipping node {node_id} because its parent {parent_id} was not included in the first pass")
#                 continue
            
#             node = id_to_node[node_id]
#             if parent_id:
#                 node.parent = id_to_node[parent_id]

#     return id_to_node

# # Function to convert tree to D3.js format
# def convert_to_d3_format(node):
#     return {
#         "name": node.text_str,
#         "children": [convert_to_d3_format(child) for child in node.children]
#     }

# #Execute functions
# data = read_jsonl('tree_text_sample_16032023/0c2cf15bf82ae16d05ba78dc3c64b36cb87cc263.jsonl')
# id_to_node = build_tree(data)
# root = [node for node in id_to_node.values() if node.is_root][0] # Get the root node
# d3_tree = convert_to_d3_format(root)

# # Save to JSON file
# with open('test.json', 'w') as f:
#     json.dump(d3_tree, f)

import os
print(os.getcwd)


import os
os.chdir('/path/to/your/desired/directory')

