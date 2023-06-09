from anytree import Node, RenderTree
import json
import sys
import os

# Function to read JSONL file


def read_jsonl(input_path: str) -> list:
    data = []
    with open(input_path, 'r', encoding='utf-8') as json_file:
        for line in json_file:
            data.append(json.loads(line))
    return data


def build_tree(data: list) -> dict:
    id_to_node = {}

    # First, create nodes
    for sublist in data:
        for node_dict in sublist:
            node_id = node_dict['self_id']
            node_text = node_dict.get('text_str', "")[:100]

            if node_id != 'r0' and node_text == "":
                print(
                    f"Skipping node {node_id} because it has an empty 'text_str'")
                continue

            id_to_node[node_id] = Node(
                node_id, parent=None, text_str=node_text)

    # Second, link nodes to their parents
    for sublist in data:
        for node_dict in sublist:
            node_id = node_dict['self_id']
            parent_id = node_dict['parent_id']

            if node_id not in id_to_node:
                print(
                    f"Skipping node {node_id} because it was not included in the first pass")
                continue
            if parent_id and parent_id not in id_to_node:
                print(
                    f"Skipping node {node_id} because its parent {parent_id} was not included in the first pass")
                continue

            node = id_to_node[node_id]
            if parent_id:
                node.parent = id_to_node[parent_id]

    return id_to_node


def convert_to_d3_format(node):
    return {
        "name": node.text_str,
        "children": [convert_to_d3_format(child) for child in node.children]
    }


def main(input_file, output_file):
    data = read_jsonl(input_file)
    id_to_node = build_tree(data)
    root = [node for node in id_to_node.values(
    ) if node.is_root][0]
    d3_tree = convert_to_d3_format(root)

    output_dir = os.path.dirname(output_file)
    os.makedirs(output_dir, exist_ok=True)

    # Save to JSON file
    with open(output_file, 'w') as f:
        json.dump(d3_tree, f)
    # print(output_file)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python data_processing.py [input_file] [output_file]")
        sys.exit(1)

    input_file = sys.argv[1]
    base_name = os.path.basename(input_file)
    filename_without_ext = os.path.splitext(base_name)[0]
    output_file = os.path.join(
        os.getcwd(), 'processed_data', filename_without_ext + '_output.json')
    main(input_file, output_file)
