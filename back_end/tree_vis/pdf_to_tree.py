from dataclasses import dataclass, fields, field
from typing import List, Dict, Tuple, Callable
import json
import fitz
import re
import numpy as np
from collections import OrderedDict, Counter
import cv2
import pandas
import pickle
import os
import base64
from anytree import Node
import importlib
import logging
import json
import sys
importlib.reload(logging)
logging.basicConfig(format='%(asctime)s %(levelname)s:%(message)s',
                    level=logging.INFO, datefmt='%I:%M:%S')


def projection_by_bboxes(boxes: np.array, axis: int) -> np.ndarray:
    assert axis in [0, 1]
    length = np.max(boxes[:, axis::2])
    # length = (np.ceil(length)).astype(int)
    res = np.zeros(length, dtype=int)
    for start, end in boxes[:, axis::2]:
        res[start:end] += 1
    return res

# from: https://dothinking.github.io/2021-06-19-%E9%80%92%E5%BD%92%E6%8A%95%E5%BD%B1%E5%88%86%E5%89%B2%E7%AE%97%E6%B3%95/#:~:text=%E9%80%92%E5%BD%92%E6%8A%95%E5%BD%B1%E5%88%86%E5%89%B2%EF%BC%88Recursive%20XY,%EF%BC%8C%E5%8F%AF%E4%BB%A5%E5%88%92%E5%88%86%E6%AE%B5%E8%90%BD%E3%80%81%E8%A1%8C%E3%80%82


def split_projection_profile(arr_values: np.array, min_value: float, min_gap: float):
    arr_index = np.where(arr_values > min_value)[0]
    if not len(arr_index):
        return

    arr_diff = arr_index[1:] - arr_index[0:-1]
    arr_diff_index = np.where(arr_diff > min_gap)[0]
    arr_zero_intvl_start = arr_index[arr_diff_index]
    arr_zero_intvl_end = arr_index[arr_diff_index + 1]

    # convert to index of projection range:
    # the start index of zero interval is the end index of projection
    arr_start = np.insert(arr_zero_intvl_end, 0, arr_index[0])
    arr_end = np.append(arr_zero_intvl_start, arr_index[-1])
    arr_end += 1  # end index will be excluded as index slice

    return arr_start, arr_end


def recursive_xy_cut(boxes: np.ndarray, indices: List[int], res: List[int]):
    assert len(boxes) == len(indices)

    _indices = boxes[:, 1].argsort()
    y_sorted_boxes = boxes[_indices]
    y_sorted_indices = indices[_indices]
    y_projection = projection_by_bboxes(boxes=y_sorted_boxes, axis=1)
    pos_y = split_projection_profile(y_projection, 0, 1)
    if not pos_y:
        return

    arr_y0, arr_y1 = pos_y
    for r0, r1 in zip(arr_y0, arr_y1):
        _indices = (r0 <= y_sorted_boxes[:, 1]) & (y_sorted_boxes[:, 1] < r1)

        y_sorted_boxes_chunk = y_sorted_boxes[_indices]
        y_sorted_indices_chunk = y_sorted_indices[_indices]
        _indices = y_sorted_boxes_chunk[:, 0].argsort()
        x_sorted_boxes_chunk = y_sorted_boxes_chunk[_indices]
        x_sorted_indices_chunk = y_sorted_indices_chunk[_indices]
        x_projection = projection_by_bboxes(boxes=x_sorted_boxes_chunk, axis=0)
        pos_x = split_projection_profile(x_projection, 0, 1)

        if not pos_x:
            continue

        arr_x0, arr_x1 = pos_x
        if len(arr_x0) == 1:
            res.extend(x_sorted_indices_chunk)
            continue

        for c0, c1 in zip(arr_x0, arr_x1):
            _indices = (c0 <= x_sorted_boxes_chunk[:, 0]) & (
                x_sorted_boxes_chunk[:, 0] < c1
            )
            recursive_xy_cut(
                x_sorted_boxes_chunk[_indices], x_sorted_indices_chunk[_indices], res
            )


def points_to_bbox(points):
    assert len(points) == 8

    left = min(points[::2])
    right = max(points[::2])
    top = min(points[1::2])
    bottom = max(points[1::2])

    left = max(left, 0)
    top = max(top, 0)
    right = max(right, 0)
    bottom = max(bottom, 0)
    return [left, top, right, bottom]


def bbox2points(bbox):
    left, top, right, bottom = bbox
    return [left, top, right, top, right, bottom, left, bottom]


def vis_polygon(img, points, thickness=2, color=None):
    br2bl_color = color
    tl2tr_color = color
    tr2br_color = color
    bl2tl_color = color
    cv2.line(
        img,
        (points[0][0], points[0][1]),
        (points[1][0], points[1][1]),
        color=tl2tr_color,
        thickness=thickness,
    )

    cv2.line(
        img,
        (points[1][0], points[1][1]),
        (points[2][0], points[2][1]),
        color=tr2br_color,
        thickness=thickness,
    )

    cv2.line(
        img,
        (points[2][0], points[2][1]),
        (points[3][0], points[3][1]),
        color=br2bl_color,
        thickness=thickness,
    )

    cv2.line(
        img,
        (points[3][0], points[3][1]),
        (points[0][0], points[0][1]),
        color=bl2tl_color,
        thickness=thickness,
    )
    return img


def vis_points(
    img: np.ndarray, points, texts: List[str] = None, color=(0, 200, 0)
) -> np.ndarray:

    points = np.array(points)
    if texts is not None:
        assert len(texts) == points.shape[0]

    for i, _points in enumerate(points):
        vis_polygon(img, _points.reshape(-1, 2), thickness=2, color=color)
        bbox = points_to_bbox(_points)
        left, top, right, bottom = bbox
        cx = (left + right) // 2
        cy = (top + bottom) // 2

        txt = texts[i]
        font = cv2.FONT_HERSHEY_SIMPLEX
        cat_size = cv2.getTextSize(txt, font, 0.5, 2)[0]

        img = cv2.rectangle(
            img,
            (cx - 5 * len(txt), cy - cat_size[1] - 5),
            (cx - 5 * len(txt) + cat_size[0], cy - 5),
            color,
            -1,
        )

        img = cv2.putText(
            img,
            txt,
            (cx - 5 * len(txt), cy - 5),
            font,
            0.5,
            (255, 255, 255),
            thickness=1,
            lineType=cv2.LINE_AA,
        )

    return img


def vis_polygons_with_index(image, points):
    texts = [str(i) for i in range(len(points))]
    res_img = vis_points(image.copy(), points, texts)
    return res_img


class UtilMath:
    def __init__(self):
        pass

    @staticmethod
    def compute_overlap_area_of_two_rectangle_with_list(r1: list[float], r2: list[float]) -> float:
        return UtilMath.compute_overlap_area_of_two_rectangle_with_int(ax1=r1[0], ay1=r1[1], ax2=r1[2], ay2=r1[3], bx1=r2[0], by1=r2[1], bx2=r2[2], by2=r2[3])

    @staticmethod
    def compute_overlap_area_of_two_rectangle_with_int(ax1: float, ay1: float, ax2: float, ay2: float, bx1: float, by1: float, bx2: float, by2: float) -> float:
        """ (x1,y1) left top (x2, y2) right bottom """
        overlap_width = min(ax2, bx2) - max(ax1, bx1)
        overlap_height = min(ay2, by2) - max(ay1, by1)
        overlap_area = max(overlap_width, 0) * max(overlap_height, 0)
        return overlap_area

    @staticmethod
    def compute_are_of_rectangle(r: list[float]):
        area = (r[2] - r[0]) * (r[3] - r[1])
        return area


class UtilData:
    def __init__(self):
        pass

    @staticmethod
    def byte_to_string_with_base64(b):
        return base64.b64encode(b).decode('utf-8')

    @staticmethod
    def string_to_byte_with_base64(s):
        return base64.b64decode(s.encode('utf-8'))

    @staticmethod
    def decimal_to_rgb(decimal):
        hexadecimal = "{:06x}".format(decimal)
        r = int(hexadecimal[0:2], 16)
        g = int(hexadecimal[2:4], 16)
        b = int(hexadecimal[4:6], 16)
        return r, g, b


class UtilString:
    def __init__(self):
        pass

    @staticmethod
    def if_str_contain_alpha(s: str) -> bool:
        for c in s:
            if c.isalpha():
                return True
        return False

    @staticmethod
    def capital_ratio(s):
        total_letters = sum(c.isalpha() for c in s)
        uppercase_letters = sum(1 for c in s if c.isupper())
        # If there are no letters in the string, return 0
        if total_letters == 0:
            return 0
        return uppercase_letters / total_letters


class UtilStructure:
    def __init__(self):
        pass

    @staticmethod
    def collect_rightest_node_of_tree(root_node, fun_to_find_child):
        children = fun_to_find_child(root_node)
        if len(children) == 0:
            return [root_node]
        right_child = children[-1]
        return [root_node] + UtilStructure.collect_rightest_node_of_tree(right_child, fun_to_find_child)

    @staticmethod
    def collect_given_node_of_tree(root_node, fun_to_find_child):
        child = fun_to_find_child(root_node)
        if child is None:
            return [root_node]
        return [root_node] + UtilStructure.collect_given_node_of_tree(child, fun_to_find_child)


@dataclass
class PDFParserConfig:
    keep_image: bool = None
    keep_image_block: bool = None
    layout_pdf_image_scale: float = None


@dataclass
class PDFBlockExample:
    manual_get_set_list = {'links'}
    temp = None  # just to save some temp variable. Do not save anything important
    page_count: int = -1
    block_report_level_count: int = -1
    block_page_level_count: int = -1
    block_report_level_xy_cut_count: int = -1
    block_page_level_xy_cut_count: int = -1
    block_number: int = -1
    block_type: int = 0
    image_width: int = 0
    image_height: int = 0
    size: float = 0.0
    model_size: float = 0.0
    font: str = ''
    color: int = 0
    colors: List[int] = field(default_factory=lambda: [0, 0, 0])  # R G B
    page_height: int = 0
    page_width: int = 0
    is_capital: bool = False
    bboxes: List[List[float]] = field(default_factory=lambda: [])
    bbox: List[float] = None
    original_bbox: List[float] = None
    adescenders: List[Tuple[float, float]] = None
    texts: List[str] = field(default_factory=lambda: [])
    text_str: str = ''
    divided_block: bool = False
    parent_id: str = ''
    children_ids: List[str] = field(default_factory=lambda: [])
    self_id: str = ''
    tree_level: int = -1
    # uninit: not initialized; root: root node; text: a text block; toc: from table of content; link_toc: contain a link and seen as toc; table: from the table of layout analysis; image: image
    # root, 'image', 'table', 'text'
    type: str = 'uninit'
    as_child_score: float = -1.0
    as_parent_scores: List[float] = field(default_factory=lambda: [])
    parent_node = None
    children_nodes: list = field(default_factory=lambda: [])
    related_table_of_content: list = None  # related toc

    def from_json(self, js: dict):
        for field in fields(self):
            if field.name not in self.manual_get_set_list and field.name in js:
                setattr(self, field.name, js[field.name])

    def to_json(self) -> dict:
        res = {}
        for field in fields(self):
            if field.name not in self.manual_get_set_list:
                res[field.name] = getattr(self, field.name)
        return res

    @staticmethod
    def get_root_node():
        pbe = PDFBlockExample(type='root',
                              tree_level=0,
                              self_id='r0',
                              size=100,
                              bbox=[0, 1, 0, 1],
                              texts=['root'],
                              text_str='root',
                              page_height=1,
                              page_width=1,
                              )
        return pbe


class PDFParser():
    def __init__(self, config: PDFParserConfig):
        self.config = config
        self.pps_engine = None
        self.toc_to_match_total = 0
        self.toc_matched_total = 0

    def get_raw_text_from_pdf(self, pdf_path, skip_none_toc=False):
        file = self.open_pdf_and_get_stream(pdf_path=pdf_path)
        if file is None:
            return None, None, None, None
        toc = self.extract_raw_table_of_content_from_pdf(
            doc=file, pdf_path=pdf_path)
        if toc is None and skip_none_toc:
            return None, None, None, None
        report = self.extract_raw_text_from_pdf(doc=file, pdf_path=pdf_path)
        metadata = self.extract_metadata_of_pdf(doc=file, pdf_path=pdf_path)
        links = self.extract_raw_links_from_pdf(doc=file, pdf_path=pdf_path)
        file.close()
        return report, metadata, toc, links

    def parse_normalization(self, report, toc, links_jsonl):
        report = self.extract_text_from_raw_text(report)
        report = self.text_list_to_str_clean(report)
        report = self.blocks_remove_no_meaning_block(report)
        report = self.blocks_remove_long_page(report, max_block_num=128)
        report = self.self_id_blocks_of_report(report)

        if links_jsonl is not None:
            links_jsonl = self.links_normalization(links=links_jsonl)
            links_example = self.convert_json_to_link_example(
                links=links_jsonl)
            # this function performs an in-class modification on report
            self.links_attach_to_block(report=report, links=links_example)
        if toc is not None:
            toc = self.toc_normalization(tocs=toc, page_minus_one=True)

        report_jsonl = self.convert_block_example_to_json(report)
        return report_jsonl, toc, links_jsonl

    def parse_xy_cut_algorithm(self, report):
        report = self.convert_json_to_block_example(report)
        report = self.embed_xy_cut_algorithm(report)
        report = self.convert_block_example_to_json(report)
        return report

    def parse_tree(self, report, toc, links, mode):
        """ toc and links may be None """
        report = self.convert_json_to_block_example(report)
        if links is not None:
            links = self.convert_json_to_link_example(links=links)
        if toc is not None:
            toc = self.convert_toc_json_to_block_example(tocs=toc)

        if mode == 'raw_rule' or mode == 'xy_cut_order_rule':
            tree_root, report = self.build_tree_from_block_toc_by_rightest_node_rule(
                report=report, tocs=toc, mode=mode)
        else:
            raise Exception('correct mode is not given for parse_tree')
        report = self.convert_block_example_to_json(report)
        return tree_root, report

    def get_report_toc_links_as_example(self, report, toc, links=None) -> Tuple[List[List[PDFBlockExample]], any, any]:
        report = self.convert_json_to_block_example(report)
        links = self.convert_json_to_link_example(
            links=links) if links is not None else None
        return report, toc, links

    def get_report_toc_links_as_jsonl(self, report, toc, links=None):
        report = self.convert_block_example_to_json(report)
        links = self.convert_link_example_to_json(
            links) if links is not None else None
        return report, toc, links

    def get_simple_text_from_text(self, report):
        report = self.convert_json_to_block_example(report)
        simple_texts = []
        for page in report:
            for block in page:
                if len(block.text_str) > 0 and block.type == 'text':
                    simple_texts.append(block.text_str)
        return simple_texts

    def parse_one_pdf_to_tree_simple(self, pdf_path):
        report, metadata, toc, _ = self.get_raw_text_from_pdf(pdf_path)
        report, toc, _ = self.parse_normalization(report, toc, None)
        report = self.parse_xy_cut_algorithm(report)
        _, report = self.parse_tree(
            report, toc, None, mode='xy_cut_order_rule')
        return report, toc, metadata

    def open_pdf_and_get_stream(self, pdf_path):
        try:
            doc = fitz.open(pdf_path)
        except fitz.fitz.FileDataError:
            logging.warning('read FileDataError on {}'.format(pdf_path))
            return None
        except RuntimeError as error:
            logging.exception(
                'read RuntimeError on {} (maybe too much recursion in tree)'.format(pdf_path))
            return None
        return doc

    def extract_raw_text_from_pdf(self, doc, pdf_path):
        read_pages = []
        try:
            for page in doc:
                text = page.get_text('dict')
                read_pages.append(text)
        except fitz.fitz.FileDataError:
            logging.warning('read FileDataError on {}'.format(pdf_path))
            return None
        except RuntimeError as error:
            logging.exception(
                'read RuntimeError on {} (maybe too much recursion in tree)'.format(pdf_path))
            return None

        image_count = -1
        page_count = -1
        block_report_level_count = -1
        for read_page in read_pages:
            page_count += 1
            read_page['page_count'] = page_count
            blocks = read_page['blocks']
            block_page_level_count = -1
            for block in blocks:
                block_page_level_count += 1
                block_report_level_count += 1
                if block['type'] == 1:
                    image_count += 1
                    if self.config.keep_image:
                        block['image'] = UtilData.byte_to_string_with_base64(
                            block['image'])
                    else:
                        block['image'] = str(image_count)
                if block['type'] != 1 and block['type'] != 0:
                    logging.warning("type is not 1 and 2:")
                    logging.warning(block)
                block['page_count'] = page_count
                block['block_page_level_count'] = block_page_level_count
                block['block_report_level_count'] = block_report_level_count
        return read_pages

    def extract_metadata_of_pdf(self, doc, pdf_path):
        try:
            metadata = doc.metadata
            return metadata
        except fitz.fitz.FileDataError:
            logging.warning('read FileDataError on {}'.format(pdf_path))
            return None
        except RuntimeError as error:
            logging.exception(
                'read RuntimeError on {} (maybe too much recursion in tree)'.format(pdf_path))
            return None

    def extract_raw_table_of_content_from_pdf(self, doc, pdf_path):
        try:
            toc = doc.get_toc(simple=True)
            # toc = sorted(toc, key=lambda x: x[2])
            return toc
        except fitz.fitz.FileDataError:
            logging.warning('read FileDataError on {}'.format(pdf_path))
            return None
        except RuntimeError as error:
            logging.exception(
                'read RuntimeError on {} (maybe too much recursion in tree)'.format(pdf_path))
            return None

    def extract_raw_links_from_pdf(self, doc, pdf_path):
        read_linkses = []
        try:
            for page in doc:
                links = page.get_links()
                read_linkses.append(links)
        except fitz.fitz.FileDataError:
            logging.warning('read FileDataError on {}'.format(pdf_path))
            return None
        except RuntimeError as error:
            logging.exception(
                'read RuntimeError on {} (maybe too much recursion in tree)'.format(pdf_path))
            return None
        except ValueError as error:
            logging.exception('read ValueError on {}'.format(pdf_path))
            return None

        page_count = -1
        for links in read_linkses:
            page_count += 1
            link_count = -1
            for link in links:
                link_count += 1
                link['from'] = list(link['from'])
                if 'to' in link:
                    link['to'] = list(link['to'])
                link['link_count'] = link_count
                link['page_count'] = page_count
        return read_linkses

    def text_list_to_str_clean(self, report: List[List[PDFBlockExample]]) -> List[List[PDFBlockExample]]:
        for page in report:
            for block in page:
                texts = block.texts
                text_str = ' '.join(texts)
                if ' ' in text_str:
                    text_str = text_str.replace(' ', ' ')
                text_str = re.sub(' +', ' ', text_str)
                if '-' in text_str:
                    text_str = text_str.replace(
                        '- ', '').replace(' -', '').replace(' ,', ',').replace(' .', '.')
                text_str = text_str.strip()
                block.text_str = text_str
                block.is_capital = UtilString.capital_ratio(text_str) > 0.9
        return report

    def extract_text_from_raw_text(self, read_pages) -> List[List[PDFBlockExample]]:
        out_pages = []
        page_count = -1
        block_report_level_count = -1
        for read_page in read_pages:
            page_count += 1
            if 'blocks' not in read_page:
                out_pages.append([])
                continue
            blocks = read_page['blocks']
            width = read_page['width']
            height = read_page['height']

            out_blocks = []
            block_page_level_count = -1

            current_text_blocks = []
            reach_text_end = False
            for i, block in enumerate(blocks):
                block_type = block['type']
                if i == len(blocks) - 1:
                    reach_text_end = True
                # image
                if block_type == '1' or block_type == 1:
                    image_block = block
                    block_number = image_block['number']
                    image_width = image_block['width']
                    image_height = image_block['height']
                    original_bbox = image_block['bbox']
                    bbox = [
                        max(0, original_bbox[0]),
                        max(0, original_bbox[1]),
                        original_bbox[2],
                        original_bbox[3]
                    ]
                    block_page_level_count += 1
                    block_report_level_count += 1
                    out_block = PDFBlockExample(
                        page_count=page_count,
                        block_page_level_count=block_page_level_count,
                        block_report_level_count=block_report_level_count,
                        block_number=block_number,
                        block_type=block_type,
                        bbox=bbox,
                        original_bbox=original_bbox,
                        type='image',
                        divided_block=False,
                        page_width=width,
                        page_height=height,
                        image_width=image_width,
                        image_height=image_height,
                    )
                    valid_block = True
                    if (original_bbox[0] < 0 and original_bbox[2] < 0) or (original_bbox[1] < 0 and original_bbox[3] < 0):
                        valid_block = False
                    if UtilMath.compute_are_of_rectangle(bbox) <= 0:
                        valid_block = False
                    if valid_block:
                        out_blocks.append(out_block)
                    reach_text_end = True
                # text
                if not reach_text_end:
                    current_text_blocks.append(block)
                else:
                    for text_block in current_text_blocks:
                        block_type = text_block['type']
                        if 'lines' not in text_block:
                            continue
                        lines = text_block['lines']
                        block_bbox = text_block['bbox']
                        sizes = []
                        fonts = []
                        colors = []
                        texts = []
                        span_bboxes = []
                        adescenders = []
                        block_number = text_block['number']
                        for line in lines:
                            line_bbox = line['bbox']
                            for spans in line['spans']:
                                if isinstance(spans, dict):
                                    spans = [spans]
                                for span in spans:
                                    span_bbox = span['bbox']
                                    if span_bbox[0] < 0 or span_bbox[1] < 0 or span_bbox[2] < 0 or span_bbox[3] < 0:
                                        continue
                                    if UtilMath.compute_are_of_rectangle(span_bbox) <= 0:
                                        continue
                                    span_bboxes.append(span_bbox)
                                    sizes.append(span['size'])
                                    fonts.append(span['font'])
                                    colors.append(span['color'])
                                    texts.append(span['text'])
                                    adescenders.append(
                                        (span['ascender'], span['descender']))
                        if len(texts) == 0:
                            continue
                        assert len(texts) == len(sizes) and len(texts) == len(fonts) and len(
                            texts) == len(colors) and len(texts) == len(span_bboxes)

                        block_out_blocks = []
                        left_index = 0
                        divided_block = False
                        for right_index in range(len(texts) + 1):
                            if right_index != len(texts) and sizes[left_index] == sizes[right_index] and fonts[left_index] == fonts[right_index] and colors[left_index] == colors[right_index]:
                                pass
                            else:
                                if right_index != len(texts):
                                    divided_block = True
                                size = set(sizes[left_index:right_index])
                                font = set(fonts[left_index:right_index])
                                color = set(colors[left_index:right_index])
                                assert len(size) == 1 and len(
                                    font) == 1 and len(color) == 1
                                size = list(size)[0]
                                font = list(font)[0]
                                color = list(color)[0]
                                text = texts[left_index:right_index]
                                adescender = adescenders[left_index:right_index]
                                bboxes = span_bboxes[left_index:right_index]
                                bbox = [min([x[0] for x in bboxes]),
                                        min([x[1] for x in bboxes]),
                                        max([x[2] for x in bboxes]),
                                        max([x[3] for x in bboxes])]
                                block_page_level_count += 1
                                block_report_level_count += 1
                                out_block = PDFBlockExample(
                                    page_count=page_count,
                                    block_page_level_count=block_page_level_count,
                                    block_report_level_count=block_report_level_count,
                                    block_number=block_number,
                                    block_type=block_type,
                                    size=size,
                                    font=font,
                                    color=color,
                                    colors=UtilData.decimal_to_rgb(color),
                                    bboxes=bboxes,
                                    bbox=bbox,
                                    adescenders=adescender,
                                    texts=text,
                                    type='text',
                                    divided_block=divided_block,
                                    page_width=width,
                                    page_height=height,
                                )
                                block_out_blocks.append(out_block)
                                left_index = right_index
                        assert left_index == len(texts)
                        assert sum([len(x.texts)
                                   for x in block_out_blocks]) == len(texts)
                        out_blocks += block_out_blocks
                    reach_text_end = False
                    current_text_blocks = []
            out_pages.append(out_blocks)
        return out_pages

    def block_merge(self, report):
        new_report = []
        for page in report:
            new_page = []
            for block in page:
                if len(new_page) == 0:
                    new_page.append(block)
                last_block = new_page[-1]
                if last_block['size'] == block['size'] and last_block['font'] == block['font'] and last_block['color'] == block['color']:
                    last_block["bbox"][0] = min(
                        last_block["bbox"][0], block["bbox"][0])
                    last_block["bbox"][1] = min(
                        last_block["bbox"][1], block["bbox"][1])
                    last_block["bbox"][2] = max(
                        last_block["bbox"][2], block["bbox"][2])
                    last_block["bbox"][3] = max(
                        last_block["bbox"][3], block["bbox"][3])
                    last_block["text"] += block['text']
                    last_block['text_str'] = last_block['text_str'] + \
                        '\n' + block['text_str']
                else:
                    new_page.append(block)
            new_report.append(new_page)
        return new_report

    def blocks_remove_no_meaning_block(self, report: List[List[PDFBlockExample]]) -> List[List[PDFBlockExample]]:
        new_report = []
        for page in report:
            new_page = []
            for block in page:
                b_text = block.text_str
                if not self.config.keep_image_block and block.type == 'image':
                    continue
                if len(b_text) < 4 and block.type == 'text':
                    has_number = False
                    for c in b_text:
                        if c.isnumeric():
                            has_number = True
                            break
                    if not has_number:
                        continue
                new_page.append(block)
            new_report.append(new_page)
        return new_report

    def blocks_remove_long_page(self, report: List[List[PDFBlockExample]], max_block_num) -> List[List[PDFBlockExample]]:
        new_report = []
        for i, page in enumerate(report):
            if len(page) < max_block_num:
                new_report.append(page)
            else:
                new_page = [block for block in page if block.type == 'text']
                new_report.append(new_page)
                logging.warning("remove long page (len {} to len {}) at {}".format(
                    len(page), len(new_page), i))
        return new_report

    def get_image_of_each_page(self, pdf_path, scale=None):
        out_image = []
        scale = self.config.layout_pdf_image_scale if scale is None else scale
        try:
            matrix = fitz.Matrix(scale, scale)
            with fitz.open(pdf_path) as doc:
                for page in doc:
                    out_image.append(page.get_pixmap(matrix=matrix))
        except fitz.fitz.FileDataError:
            logging.warning('read FileDataError on {}'.format(pdf_path))
            return None
        except RuntimeError as error:
            logging.exception(
                'read RuntimeError on {} (maybe too much recursion in tree)'.format(pdf_path))
            return None
        except ValueError as error:
            logging.exception('read ValueError on {}'.format(pdf_path))
            return None
        return out_image

    def embed_xy_cut_algorithm(self, report_block: List[List[PDFBlockExample]]) -> List[List[PDFBlockExample]]:
        new_report = []
        block_report_level_xy_cut_count = -1
        for i, page in enumerate(report_block):
            if len(page) < 1:
                new_report.append(page)
                continue
            page_bboxs = []
            for block in page:
                int_bbox = [int(max(0, x)) for x in block.bbox]
                page_bboxs.append(int_bbox)
            sorted_res = []
            recursive_xy_cut(boxes=np.asarray(page_bboxs),
                             indices=np.arange(len(page_bboxs)), res=sorted_res)
            if len(sorted_res) != len(page):
                not_in_sorted_res = [i for i in range(
                    len(page)) if i not in sorted_res]
                logging.error('sorted_res_len={}, page_len={}, page={} with missed index {}'.format(
                    len(sorted_res), len(page), i, not_in_sorted_res))
            else:
                not_in_sorted_res = []
            block_page_level_xy_cut_count = -1
            new_page = []
            for sorted_id in sorted_res + not_in_sorted_res:
                block_report_level_xy_cut_count += 1
                block_page_level_xy_cut_count += 1
                block = page[sorted_id]
                block.block_report_level_xy_cut_count = block_report_level_xy_cut_count
                block.block_page_level_xy_cut_count = block_page_level_xy_cut_count
                new_page.append(block)
            assert len(page) == len(new_page)
            new_report.append(new_page)
        return new_report

    def convert_json_to_block_example(self, report) -> List[List[PDFBlockExample]]:
        new_report = []
        for page in report:
            new_page = []
            for block in page:
                new_block = PDFBlockExample()
                new_block.from_json(block)
                new_page.append(new_block)
            new_report.append(new_page)
        return new_report

    def convert_block_example_to_json(self, report: List[List[PDFBlockExample]]):
        new_report = []
        for page in report:
            new_page = []
            for block in page:
                new_block = block.to_json()
                new_page.append(new_block)
            new_report.append(new_page)
        return new_report

    def links_normalization(self, links):
        new_links = []
        for page in links:
            new_page = []
            for link in page:
                kind = link['kind']
                xref = link['xref']
                bbox = list(link['from'])
                to_page = link['page'] if kind == 1 else -1
                to_point = list(link['to']) if kind == 1 else None
                to_uri = link['uri'] if kind == 2 else ''
                new_link = {
                    'kind': kind,
                    'xref': xref,
                    'bbox': bbox,
                    'to_page': to_page,
                    'to_point': to_point,
                    'to_uri': to_uri,
                }
                new_page.append(new_link)
            new_links.append(new_page)
        return new_links

    def toc_normalization(self, tocs, page_minus_one=False):
        def get_key(x):
            return str(x[0]) + str(x[1]) + str(x[2])
        previous_toc = set()
        new_tocs = []
        for toc in tocs:
            key = get_key(toc)
            if not UtilString.if_str_contain_alpha(toc[1]):
                logging.warning("toc not contain alpha: {}".format(toc))
                continue
            if key in previous_toc:
                logging.warning("duplicate toc: {}".format(toc))
                continue
            previous_toc.add(key)
            if page_minus_one:
                toc[2] -= 1
            if toc[2] < 0:
                logging.warning("page less than 0 toc: {}".format(toc))
                continue
            new_tocs.append(toc)
        tocs = new_tocs

        if len(tocs) > 0 and len(tocs[0]) >= 4:
            previous_self_id = set()
            new_tocs = []
            for toc in tocs:
                if toc[3] in previous_self_id:
                    logging.warning(
                        "duplicate self id of table of content: {}".format(toc))
                    continue
                previous_self_id.add(toc[3])
                new_tocs.append(toc)
            tocs = new_tocs

        if len(tocs) > 0 and tocs[0][0] != 1 and tocs[0][0] != 0:
            logging.warning(
                "toc: the first line level is not 1 and 0, but {}. Fixing".format(tocs[0]))
            min_level = min([toc[0] for toc in tocs])
            to_subtract_level = min_level - 1
            for toc in tocs:
                toc[0] = toc[0] - to_subtract_level

        new_tocs = []
        last_toc = None
        for toc in tocs:
            if last_toc is None:
                if toc[0] != 1 and toc[0] != 0:
                    logging.warning(
                        "toc error: the first line level is not 1 and 0, but {}".format(toc))
                    continue
            else:
                if toc[0] > last_toc[0] + 1:
                    logging.warning(
                        "toc error: toc_level > last_toc_level + 1, {} > {} + 1".format(toc, last_toc))
                    continue
            new_tocs.append(toc)
            last_toc = toc
        tocs = new_tocs

        new_tocs = []
        last_toc = None
        for toc in tocs:
            if last_toc is not None:
                if toc[2] < last_toc[2]:
                    logging.warning(
                        "toc error: toc_page < last_toc_page, {} > {}".format(toc, last_toc))
                    continue
            new_tocs.append(toc)
            last_toc = toc
        tocs = new_tocs

        new_tocs = []
        last_toc = None
        for toc in tocs:
            if last_toc is None:
                if toc[0] != 1 and toc[0] != 0:
                    logging.warning(
                        "toc error: the first line level is not 1 and 0, but {}".format(toc))
                    continue
            else:
                if toc[0] > last_toc[0] + 1:
                    logging.warning(
                        "toc error: toc_level > last_toc_level + 1, {} > {} + 1".format(toc, last_toc))
                    continue
            new_tocs.append(toc)
            last_toc = toc
        tocs = new_tocs
        return new_tocs

    def self_id_blocks_of_report(self, report: List[List[PDFBlockExample]]) -> List[List[PDFBlockExample]]:
        block_id = 0
        image_id = 0
        table_id = 0
        for page in report:
            for block in page:
                if block.type == 'image':
                    block.self_id = 'i' + str(image_id)
                    image_id += 1
                elif block.type == 'table':
                    block.self_id = 't' + str(image_id)
                    table_id += 1
                else:
                    block.self_id = 'b' + str(block_id)
                    block_id += 1
        return report

    def convert_toc_json_to_block_example(self, tocs) -> List[PDFBlockExample]:
        count_id = 0
        toc_examples = []
        for toc in tocs:
            be = PDFBlockExample(
                page_count=toc[2],
                texts=[toc[1]],
                text_str=toc[1],
                self_id='c' + str(count_id),
                type='toc',
                tree_level=toc[0]
            )
            toc_examples.append(be)
            count_id += 1
        return toc_examples

    def report_to_tree_nodes(self, report: List[List[PDFBlockExample]]):
        id_to_block = {
            block.self_id: block for page in report for block in page}
        root_node: PDFBlockExample = id_to_block['r0']

        def build_tree(node: PDFBlockExample):
            children: List[PDFBlockExample] = [id_to_block[cid]
                                               for cid in node.children_ids]
            node.children_nodes = children
            for child in children:
                child.parent_node = node
                build_tree(node=child)

        build_tree(root_node)
        return root_node

    def build_tree_from_block_toc_by_rightest_node_rule(self, report: List[List[PDFBlockExample]], tocs: List[PDFBlockExample], mode):
        has_toc = True if tocs is not None else False
        id_to_block: Dict[str, PDFBlockExample] = {
            block.self_id: block for page in report for block in page}
        if has_toc:
            id_to_tocs: Dict[str, PDFBlockExample] = {
                toc.self_id: toc for toc in tocs}

        def fun_to_find_child(node: PDFBlockExample):
            children_ids = node.children_ids
            if len(children_ids) == 0:
                return None
            final_res = None
            for i in reversed(range(len(children_ids))):
                right_child_id = children_ids[i]
                if right_child_id.startswith('b') or right_child_id.startswith('t') or right_child_id.startswith('i'):
                    res = id_to_block[right_child_id]
                elif right_child_id.startswith('c'):
                    res = id_to_tocs[right_child_id]
                else:
                    raise Exception(
                        'build_tree_from_block_toc got id: {}'.format(right_child_id))
                if mode in ['raw_rule', 'xy_cut_order_rule']:
                    if res.type == 'image':
                        continue
                final_res = res
                break
            return final_res

        root_node = PDFBlockExample.get_root_node()
        toc_current_index = 0
        new_report = []
        for page_count, page in enumerate(report):
            new_page = []
            # table of content
            while has_toc and toc_current_index < len(tocs) and tocs[toc_current_index].page_count == page_count:
                toc = tocs[toc_current_index]
                rightest_node_collection: List[PDFBlockExample] = UtilStructure.collect_given_node_of_tree(
                    root_node, fun_to_find_child=fun_to_find_child)
                self.strategy_of_rightest_tree_combine_for_toc(
                    toc=toc, rightest_node_collection=rightest_node_collection)
                toc_current_index += 1
                new_page.append(toc)

            for block in page:
                if mode in ['raw_rule'] and block.type == 'image':
                    continue
                rightest_node_collection: List[PDFBlockExample] = UtilStructure.collect_given_node_of_tree(
                    root_node, fun_to_find_child=fun_to_find_child)
                if mode == 'raw_rule':
                    self.strategy_of_rightest_tree_combine_for_block(
                        block=block, rightest_node_collection=rightest_node_collection)
                elif mode == 'xy_cut_order_rule':
                    self.strategy_of_rightest_tree_simple_xy_cut_for_block(
                        block=block, rightest_node_collection=rightest_node_collection)
                else:
                    raise Exception(
                        "incorrect mode got in build_tree_from_block_toc_by_rightest_node_rule as {}".format(mode))
                new_page.append(block)
            new_report.append(new_page)
        new_report[0] = [root_node] + new_report[0]
        return root_node, new_report

    def strategy_of_rightest_tree_combine_for_toc(self, toc: PDFBlockExample, rightest_node_collection: List[PDFBlockExample]):
        p_toc = rightest_node_collection[toc.tree_level - 1]
        p_toc.children_ids.append(toc.self_id)
        toc.parent_id = p_toc.self_id
        toc.as_child_score = 1
        p_toc.as_parent_scores.append(1)
        toc.tree_level = p_toc.tree_level + 1

    def strategy_of_rightest_tree_combine_for_block(self, block: PDFBlockExample, rightest_node_collection: List[PDFBlockExample]):
        # '(1,=,'b')',  '(1,=,'b')'
        scores_dict = {}
        for i, right_node in enumerate(rightest_node_collection):
            scores_dict[(i, '>', 'b')] = self.calculate_score_for_p_is_parent_of_c_block(
                right_node, block)
            scores_dict[(i, '<', 'b')] = self.calculate_score_for_u_is_upper_level_of_d_block(
                block, right_node)
            scores_dict[(i, '=', 'b')] = self.calculate_score_for_a_is_same_level_of_b_block(
                block, right_node)

        # other constraint
        scores_dict[(0, '=', 'b')] = -1
        scores_dict[(0, '<', 'b')] = -1
        scores_dict[(1, '<', 'b')] = -1
        if len(rightest_node_collection) >= 2:
            scores_dict[(len(rightest_node_collection), '<', 'b')] = (0.3 * scores_dict[(len(rightest_node_collection) -
                                                                                         2, '>', 'b')] + 0.4 * scores_dict[(len(rightest_node_collection) - 1, '=', 'b')]) / (0.3 + 0.4)
        if len(rightest_node_collection) >= 1:
            scores_dict[(len(rightest_node_collection), '=', 'b')] = scores_dict[(
                len(rightest_node_collection) - 1, '>', 'b')]
            scores_dict[(len(rightest_node_collection) + 1, '<', 'b')
                        ] = scores_dict[(len(rightest_node_collection) - 1, '>', 'b')]

        final_score_of_block_parent_level = [0] * len(rightest_node_collection)
        for i, right_node in enumerate(rightest_node_collection):
            final_score_of_block_parent_level[i] = 0.3 * scores_dict[(
                i, '>', 'b')] + 0.4 * scores_dict[(i + 1, '=', 'b')] + 0.3 * scores_dict[(i + 2, '<', 'b')]

        # if has table of content
        min_toc_level = 0
        for i, right_node in enumerate(rightest_node_collection):
            if right_node.type == 'toc':
                min_toc_level = i
        for i in range(0, min_toc_level):
            final_score_of_block_parent_level[i] = -1

        # penalty for too long tree
        max_tree_level = 32
        start_penalty_level = 10
        for i in range(10, len(final_score_of_block_parent_level)):
            ratio = 1 - (i - start_penalty_level) / \
                (max_tree_level - start_penalty_level)
            ratio = max(0, ratio)
            final_score_of_block_parent_level[i] = final_score_of_block_parent_level[i] * ratio

        max_score, max_i = UtilStructure.find_max_and_number_index(
            final_score_of_block_parent_level)
        rightest_node_collection[max_i].children_ids.append(block.self_id)
        block.parent_id = rightest_node_collection[max_i].self_id
        block.as_child_score = max_score
        rightest_node_collection[max_i].as_parent_scores.append(max_score)
        block.tree_level = rightest_node_collection[max_i].tree_level + 1

    def calculate_score_for_p_is_parent_of_c_block(self, p_block: PDFBlockExample, c_block: PDFBlockExample) -> float:
        # root
        if c_block.type == 'root':
            return 0
        if p_block.type == 'root':
            # len
            if len(c_block.text_str.split()) <= 10:
                score_len = 0.9
            elif len(c_block.text_str.split()) <= 20:
                score_len = 0.2
            else:
                score_len = 0
            # size
            if c_block.size > 50:
                score_size = 1
            elif c_block.size > 40:
                score_size = 0.9
            elif c_block.size > 30:
                score_size = 0.7
            elif c_block.size > 20:
                score_size = 0.2
            else:
                score_size = 0
            # lines
            if len(c_block.texts) <= 1:
                score_lines = 1
            elif len(c_block.texts) <= 2:
                score_lines = 0.7
            elif len(c_block.texts) <= 3:
                score_lines = 0.4
            else:
                score_lines = 0
            root_score = score_len * score_size * score_lines
            return root_score
        # toc
        if c_block.type == 'toc' and p_block.type != 'toc':
            return 0
        if c_block.type != 'toc' and p_block.type == 'toc':
            # len
            if len(c_block.text_str.split()) <= 10:
                score_len = 0.9
            elif len(c_block.text_str.split()) <= 15:
                score_len = 0.6
            elif len(c_block.text_str.split()) <= 20:
                score_len = 0.3
            else:
                score_len = 0.1
            # size
            if c_block.size > 40:
                score_size = 1
            elif c_block.size > 30:
                score_size = 0.9
            elif c_block.size > 20:
                score_size = 0.75
            elif c_block.size > 15:
                score_size = 0.5
            elif c_block.size > 10:
                score_size = 0.25
            else:
                score_size = 0.1
            # lines
            if len(c_block.texts) <= 1:
                score_lines = 1
            elif len(c_block.texts) <= 2:
                score_lines = 0.8
            elif len(c_block.texts) <= 3:
                score_lines = 0.5
            elif len(c_block.texts) <= 4:
                score_lines = 0.2
            else:
                score_lines = 0.1
            toc_score = score_len * score_size * score_lines
            return toc_score
        # page
        if p_block.page_count < c_block.page_count:
            return 0
        # vertical position
        if p_block.page_count > c_block.page_count:
            score_vertical = 1
        elif p_block.page_count == c_block.page_count:
            if p_block.bbox[1] > c_block.bbox[1]:
                score_vertical = 1
            else:
                overlap_ver = UtilMath.two_line_overlap(
                    x1=p_block.bbox[1], x2=p_block.bbox[3], y1=c_block.bbox[1], y2=c_block.bbox[3])
                overlap_ver_ratio = overlap_ver / \
                    (p_block.bbox[3] - p_block.bbox[1])
                score_vertical = 0.5 * overlap_ver_ratio + 0.1
        else:
            score_vertical = 0
        # horizontal position
        line_overlap = UtilMath.two_line_overlap(
            x1=p_block.bbox[0], x2=p_block.bbox[2], y1=c_block.bbox[0], y2=c_block.bbox[2])
        p_overlap_ratio = line_overlap / (p_block.bbox[2] - p_block.bbox[0])
        c_overlap_ratio = line_overlap / (c_block.bbox[2] - c_block.bbox[0])
        score_horizontal = max(p_overlap_ratio, c_overlap_ratio)
        if p_block.page_count > c_block.page_count:
            score_horizontal = max(0.9, score_horizontal)
        # position
        score_position = score_horizontal * score_vertical
        # size
        if p_block.size > c_block.size:
            score_size = 1
        else:
            score_size = 0.1
        # len
        if len(p_block.text_str.split()) < len(c_block.text_str.split()) - 20:
            score_len = 1
        elif len(p_block.text_str.split()) > len(c_block.text_str.split()) + 10:
            score_len = 0
        else:
            # p-20 < c < p+20
            score_len = (len(c_block.text_str.split()) + 10 -
                         len(p_block.text_str.split())) / 30
        final_score = score_position * score_size * score_len
        assert 0 <= final_score <= 1
        return final_score

    def calculate_score_for_u_is_upper_level_of_d_block(self, u_block: PDFBlockExample, d_block: PDFBlockExample) -> float:
        u_text = u_block.text_str
        u_has_alphabet = False
        for c in u_text:
            if c.isalpha():
                u_has_alphabet = True
                break
        if not u_has_alphabet:
            return -1
        return self.calculate_score_for_p_is_parent_of_c_block(p_block=u_block, c_block=d_block)

    def calculate_score_for_a_is_same_level_of_b_block(self, a_block: PDFBlockExample, b_block: PDFBlockExample) -> float:
        # root
        if a_block.type == 'root' or b_block.type == 'root':
            return 0
        # toc
        if (a_block.type == 'toc' and b_block.type != 'toc') or (a_block.type != 'toc' and b_block.type == 'toc'):
            return 0
        # page
        if abs(a_block.page_count - b_block.page_count) > 1:
            return 0
        # vertical position
        if a_block.page_count != b_block.page_count:
            score_v_overlap = 0.8
        else:
            line_overlap = UtilMath.two_line_overlap(
                x1=a_block.bbox[1], x2=a_block.bbox[3], y1=b_block.bbox[1], y2=b_block.bbox[3])
            a_overlap_ratio = line_overlap / \
                (a_block.bbox[3] - a_block.bbox[1])
            b_overlap_ratio = line_overlap / \
                (b_block.bbox[3] - b_block.bbox[1])
            score_v_overlap = max(a_overlap_ratio, b_overlap_ratio)
        # horizontal position
        line_overlap = UtilMath.two_line_overlap(
            x1=a_block.bbox[0], x2=a_block.bbox[2], y1=b_block.bbox[0], y2=b_block.bbox[2])
        a_overlap_ratio = line_overlap / (a_block.bbox[2] - a_block.bbox[0])
        b_overlap_ratio = line_overlap / (b_block.bbox[2] - b_block.bbox[0])
        score_h_overlap = max(a_overlap_ratio, b_overlap_ratio)
        if a_block.page_count != b_block.page_count:
            score_h_overlap = max(0.6, score_h_overlap)
        # position
        score_position = max(score_h_overlap, score_v_overlap)
        # size
        size_gap = abs(a_block.size - b_block.size)
        if size_gap > 1:
            score_size = 0.1
        else:
            score_size = 1
        # len
        len_gap = abs(len(a_block.text_str.split()) -
                      len(b_block.text_str.split()))
        if len_gap < 20:
            score_len = 1
        elif len_gap < 30:
            score_len = 0.9
        else:
            score_len = 0.8
        final_score = score_position * score_size * score_len
        assert 0 <= final_score <= 1
        return final_score

    def strategy_of_rightest_tree_simple_xy_cut_for_block(self, block: PDFBlockExample, rightest_node_collection: List[PDFBlockExample]):
        for i in reversed(range(len(rightest_node_collection))):
            up_block = rightest_node_collection[i]
            is_parent = False
            if block.type in ['table', 'image']:
                is_parent = True
            if up_block.type in ['root', 'toc']:
                is_parent = True
            if block.size < up_block.size:
                is_parent = True
            if block.size == up_block.size and ('bold' not in block.font.lower() and 'bold' in up_block.font.lower()):
                is_parent = True
            if is_parent:
                up_block.children_ids.append(block.self_id)
                up_block.as_parent_scores.append(1)
                block.parent_id = up_block.self_id
                block.as_child_score = 1
                block.tree_level = up_block.tree_level + 1
                break


def get_config() -> PDFParserConfig:
    config = PDFParserConfig()
    config.keep_image = False
    config.keep_image_block = False
    return config


def make_tree(data, node_id, tree):
    children = [item for item in data if item['parent_toc_id'] == node_id]
    if children:
        tree['children'] = []
        for child in children:
            child_name = child['name'][:50] + \
                '...' if len(child['name']) > 50 else child['name']
            child_node = {'name': child_name, 'children': []}
            tree['children'].append(child_node)
            make_tree(data, child['toc_id'], child_node)
    return tree


def make_tree_report(data, node_id, tree):
    children = [item for item in data if item['parent_id'] == node_id]
    if children:
        tree['children'] = []
        for child in children:
            child_name = child['text_str'][:50] + \
                '...' if len(child['text_str']) > 50 else child['text_str']
            child_node = {'name': child_name, 'children': []}
            tree['children'].append(child_node)
            make_tree_report(data, child['self_id'], child_node)
    return tree


def main(input_file, output_file):
    config = get_config()
    pdf_parser = PDFParser(config=config)

    report, toc, metadata = pdf_parser.parse_one_pdf_to_tree_simple(input_file)

    flat_report = [item for sublist in report for item in sublist]
    print(flat_report)

    print(toc)

    # Convert table of contents to list of dictionaries
    toc_dicts = [{'toc_id': i+1, 'name': item[1], 'parent_toc_id': item[2]}
                 for i, item in enumerate(toc)]

    # Create hierarchical tree
    root_nodes = [item for item in toc_dicts if item['parent_toc_id'] == 0]
    if root_nodes:  # Check if the list is not empty
        root_node = root_nodes[0]
        tree = {'name': root_node['name'], 'children': []}
        tree = make_tree(toc_dicts, root_node['toc_id'], tree)
    else:
        # Handle the case where no root node was found in the table of contents
        print('No root node found in the table of contents. Falling back to report data...')
        root_nodes_report = [
            item for item in flat_report if item['type'] == 'root']

        if root_nodes_report:
            root_node_report = root_nodes_report[0]
            tree = {'name': root_node_report['text_str'], 'children': []}
            # Use flat_report here
            tree = make_tree_report(
                flat_report, root_node_report['self_id'], tree)
        else:
            print('No root node found in the report data')
            tree = {'name': 'default', 'children': []}

    # Write to JSON file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(tree, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python pdf_to_tree.py [input_file] [output_file]")
        sys.exit(1)

    input_file = sys.argv[1]
    base_name = os.path.basename(input_file)
    filename_without_ext = os.path.splitext(base_name)[0]

    script_directory = os.path.dirname(__file__)
    output_directory = os.path.join(script_directory, '..', 'processed_data')

    output_file = os.path.join(
        output_directory, filename_without_ext + '_output.json')
    main(input_file, output_file)
