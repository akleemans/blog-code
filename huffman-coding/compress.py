import struct
import numpy
import pydot

class Node(object):
    def __init__(self, idx, symbol, weight, child1=None, child2=None):
        self.idx = idx
        self.symbol = symbol
        self.weight = weight
        self.child1 = child1
        self.child2 = child2
        self.bits = ''

def get_node(s):
    global nodes2
    for n2 in nodes2:
        symbol = n2.symbol.replace('[nl]', '\n').replace('[sp]', ' ')[1:2]
        if s == symbol:
            return n2

node_by_bits = lambda s: [n for n in nodes2 if n.bits == s]

graph = pydot.Dot(graph_type='graph')

with open('shakespeare.txt', 'r') as shakespeare:
    data = shakespeare.read()

chars = list(set(data))
print('Found', len(chars), 'different characters, initializing nodes')

nodes = []
idx = 0
for c in chars:
    n = Node(str(idx), '"' + c.replace('\n', '[nl]').replace(' ', '[sp]') + '"',
             data.count(c))
    idx += 1
    nodes.append(n)
nodes.sort(key=lambda x: x.weight, reverse=True)

# Copy tree
nodes2 = []
for node in nodes:
    nodes2.append(node)

print('Building tree')
while len(nodes) > 1:
    nodes.sort(key=lambda x: x.weight, reverse=True)
    # Build new node
    c = [nodes.pop(), nodes.pop()]
    n = Node(str(idx), str(idx), c[0].weight + c[1].weight, c[0], c[1])
    idx += 1
    nodes.append(n)
    for child in c:
        edge = pydot.Edge(str(n.symbol), str(child.symbol))
        graph.add_edge(edge)
graph.write_png('graph.png')

# Traverse tree, assign bits
while len(nodes) > 0:
    n = nodes.pop(0)
    if n.child1 is not None:
        nodes.append(n.child1)
        n.child1.bits = n.bits + '0'
    if n.child2 is not None:
        nodes.append(n.child2)
        n.child2.bits = n.bits + '1'

print("\nNodes:")
for node in nodes2:
    print(str(node.idx) + '\t' + str(node.symbol) + '\t' + str(
        node.weight) + '\t' + str(node.bits))

print('Generating compressed file...')
with open('compressed.bin', 'wb') as write_file:
    buff = ''
    for c in data:
        bits = get_node(c).bits
        buff += bits
        if len(buff) >= 16:
            byte = buff[8:16] + buff[0:8]
            buff = buff[16:]
            bin_array = struct.pack('H', int(byte, base=2))
            write_file.write(bin_array)

print('Decompress file...')
_bytes = numpy.fromfile('compressed.bin', dtype="uint8")
bits = numpy.unpackbits(_bytes)
with open('decompressed.txt', 'w') as write_file:
    buffer = ''
    for bit in bits:
        buffer += str(bit)
        nodes = node_by_bits(buffer)
        if len(nodes) == 1:
            write_file.write(
                nodes[0].symbol.replace('"', '').replace('[sp]', ' ').replace(
                    '[nl]', '\n'))
            buffer = ''
