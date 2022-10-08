class GraphDOM {
    nodes = {};
    edges = [];

    /**
     * 
     * @param {*} id a string (could be node.id or something else)
     * @param {*} node a HTML element
     */
    addNode(id, node) { this.nodes[id] = node; }

    addEdge(id1, id2, type = "->") {
        function getDotCode() {
            switch (type) {
                case "->": return id1 + " -> " + id2;
                case "=>": return id1 + " -> " + id2;
                case "==": return id1 + " -> " + id2 + ' [arrowhead=none];';
                case "- - -": return `{ rank = same; ${id1}; ${id2} }  \n` + id1 + " -> " + id2 + ' [ style="dashed", arrowhead=none ];';
                case "<->": case "<=>": return id1 + " -> " + id2 + ' [dir=both];';
                default: throw `Error: ${type} unknown type`;
            }
        }
        const edge = { id1: id1, id2: id2, dotCode: getDotCode() };
        this.edges.push(edge);
        return edge;
    }


    prepare() {
        const temp = document.createElement("div");
        document.body.appendChild(temp);

        for (const id in this.nodes) {
            this.nodes[id].style.display = "inline-block";
            temp.appendChild(this.nodes[id]);

        }
    }

    /**
     * 
     * @returns a HTML element containing the graph (it uses Viz)
     */
    makeGraphWithGraphViZAndElements() {
        const nodes = this.nodes;
        const edges = this.edges;
        const el = document.createElement("div");
        /**
         * 
         * @param {*} dotCode (graphviz format)
         * @returns the HTML code that represents the graph of the code dotCode (graphviz format)
         */
        function svgFromDot(dotCode) { return Viz(dotCode, "svg"); }

        let dotCode = `digraph {`;

        for (const id in nodes) {
            const node = nodes[id];
            MathJax.typeset();
            const rect = node.getBoundingClientRect();
            const width = rect.width;

            console.log(`node of id ${id} + has width ${width}`);
            console.log(node)
            const height = rect.height;
            const factor = 1.7 / (96);
            dotCode += `${id} [width = ${width * factor}, height = ${height * factor}];\n`;
        }


        const attrFakeNode = ' [label="", shape=point, width=0.01, height=0.01]; \n';

        for (const edge of edges) {
            if (nodes[edge.id1] == undefined)
                dotCode += edge.id1 + attrFakeNode;

            if (nodes[edge.id2] == undefined)
                dotCode += edge.id2 + attrFakeNode;
            dotCode += edge.dotCode + "\n";

        }


        dotCode += `}`;

        console.log(dotCode)

        el.innerHTML = svgFromDot(dotCode);

        function removeStrokeColorsFromEdges(el) {
            for (const p of el.querySelectorAll("polygon"))
                if (p.parentNode.parentNode.tagName != "svg") {
                    p.setAttribute("stroke", "");
                    p.setAttribute("fill", "");
                    p.classList.add("edge");
                }

            for (const p of el.querySelectorAll("path")) {
                p.setAttribute("stroke", "");
                p.classList.add("edge");
            }


        }

        removeStrokeColorsFromEdges(el);
        let i = 1;

        for (const id in nodes) {
            const node = nodes[id];

            const queryNode = "#node" + i;
            const nodeElement = el.querySelector(queryNode);

            if (nodeElement == null)
                console.log(queryNode + " not found");
            const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', "foreignObject");
            nodeElement.appendChild(foreignObject);

            const ellipseElement = el.querySelector("#node" + i + " > ellipse");
            ellipseElement.style.visibility = "hidden";

            const textElement = el.querySelector("#node" + i + " > text");
            if (textElement)
                textElement.style.visibility = "hidden";
            if (ellipseElement != null) {
                const w = node.getBoundingClientRect().width;
                const h = node.getBoundingClientRect().height;
                //const w = node.innerHTML.indexOf("\\(") > -1 ? 0 : node.clientWidth / 2-8;
                const x = parseInt(ellipseElement.getAttribute("cx")) - parseInt(ellipseElement.getAttribute("rx")) + 4;
                const y = parseInt(ellipseElement.getAttribute("cy")) - parseInt(ellipseElement.getAttribute("ry")) + 6;
                foreignObject.setAttribute("x", x + "");
                foreignObject.setAttribute("y", y + "");
                foreignObject.setAttribute("width", w * 2);
                foreignObject.setAttribute("height", h * 2);
                foreignObject.appendChild(node);
                i++;
            } else
                throw "text Element '" + query + "' not found";

        }

        return el;
    }


}