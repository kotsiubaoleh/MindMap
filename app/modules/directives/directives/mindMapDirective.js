export default function($window) {

        return {
            scope: {
                root: "=",
                save: "&onSave",
                delete: "&onDelete",
                insert: "&onInsert"
            },
            
            restrict: "E",

            templateUrl: "./app/views/mindMap.html",

            link: function (scope, element, attrs) {

                //console.dir(scope.edit);
                // scope.edit({edit:function () {
                //     alert("Directive");
                // }});
                
                var editable = "editable" in attrs;

                scope.selectedNode = {};

                var input = element.find("input");

                var selectedElement  = null;

                var isMenuVisible = false;

                var sideMenu = element.children(".sideMenu");

                var eleW = element.prop("clientWidth"),
                    eleH = element.prop("clientHeight");

                var m = [20, 40, 20, 80],
                    w = eleW - m[1] - m[3],
                    h = eleH - m[0] - m[2],
                    i = 0;

                var tree = d3.layout.tree().size([h, w]);
                var diagonal = d3.svg.diagonal().projection(function (d) {
                    return [d.y, d.x];
                });

                var canvas = d3.select(element[0]).append("svg:svg")
                    .attr("width", w + m[1] + m[3])
                    .attr("height", h + m[0] + m[2])
                    .on("click", function() {
                        if (d3.event.target.nodeName != "svg" ) return;
                        clearSelection();
                    });

                var vis = canvas.append("svg:g")
                    .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

                function updateDimensions() {
                    w = element.prop('clientWidth') - m[1] - m[3] - (isMenuVisible?sideMenu.prop("clientWidth"):0);
                    h = element.prop('clientHeight') - m[1] - m[3];
                    canvas.attr("width", element.prop("clientWidth"))
                        .attr("height", element.prop("clientWidth"));
                    update(scope.root);
                }

                function showSideMenu() {
                    sideMenu.removeClass("menuHidden");
                    isMenuVisible = true;
                    updateDimensions();
                }

                function hideSideMenu() {
                    sideMenu.addClass("menuHidden");
                    isMenuVisible = false;
                    updateDimensions();
                }

                function selectNode(d) {
                    if (selectedElement != null) {
                        selectedElement.select("circle").classed("selected", false);
                    }
                    
                    selectedElement = d3.select(this);
                    selectedElement.select("circle").classed("selected",true);
                    showSideMenu();
                    //input[0].focus();
                    scope.$apply(function () {
                        scope.selectedNode = d;
                    });
                }

                function clearSelection() {
                    if (selectedElement != null) {
                        selectedElement.select("circle").classed("selected", false);
                        hideSideMenu();
                        input[0].blur();
                    }
                }

                scope.addNewNode = function (d) {
                    var newNode = {
                        "depth": d.depth + 1,
                        "name": "new Node",
                        "parent": d
                    };
                    scope.insert({node:newNode,
                    success: function (id) {
                        newNode._id = id;
                        if (!d.children) d.children = [];
                        d.children.push(newNode);
                        update(d);
                    }, fail: function () {
                        //TODO: show notification
                    }});
                };

                scope.removeNode = function (d) {
                    if (!d.parent) {
                        alert("Cannot remove root");
                        return;
                    }
                    scope.delete({node: scope.selectedNode,
                        success: function () {
                            var thisId = d.id;
                            d.parent.children.forEach(function (c, index) {
                                if (thisId === c.id) {
                                    d.parent.children.splice(index, 1);
                                }
                            });
                            update(d.parent);
                            clearSelection();
                        }, fail: function () {
                            //TODO: show notification
                        }
                    })
                };

                scope.onSave = function() {
                    scope.save({node: scope.selectedNode,
                    success: function () {
                        //TODO: show notification
                    }, fail: function () {
                        //TODO: show notification
                    }});
                };

                $window.onresize = function () {
                    updateDimensions();
                };

                scope.$watch('root', function () {
                    if (!(scope.root != null)) {
                        scope.root = {
                            "name": "root"
                        }
                    }
                    //scope.root = scope.json;
                    scope.root.x0 = h / 2;
                    scope.root.y0 = 0;
                    update(scope.root);
                    //scope.root = root;
                });

                scope.$watch('selectedNode.name', function () {
                    update(scope.selectedNode,0);
                    updateSelectedText();
                });

                function updateSelectedText(d) {
                    if (selectedElement != null) {
                        var textNode = selectedElement.select("g.container").select("text");
                        textNode.text(scope.selectedNode.name);
                        textNode.property("textContent", scope.selectedNode.name);
                        var textWidth = textNode.node().getBBox().width;

                        if (!editable) {
                            var checkboxContainer = selectedElement.select("g.checkbox");

                            var checkboxWidth = checkboxContainer.select("rect").attr("width");

                            var side = textNode.attr("text-anchor") === "start" ? 1 : -1;
                            var checkboxOffset = side * (textWidth + checkboxWidth * (side === -1 ? 2 : 1));

                            checkboxContainer.attr("transform", "translate(" + checkboxOffset + " -8)");
                        }
                    }
                 }

                function update(source) {

                    if (!(source != null)) {
                        return;
                    }

                    var duration = 300;
                    // Compute the new tree layout.

                    var nodes = tree.nodes(scope.root).reverse();

                    // Normalize for fixed-depth.
                    var deepest = 0,
                        generationGutter = w;
                    nodes.forEach(function (d) {
                        if (deepest < d.depth) {
                            deepest = d.depth;
                        }
                    });
                    generationGutter = Math.floor(w / (deepest + 1));
                    nodes.forEach(function (d) {
                        d.y = d.depth * generationGutter;
                    });

                    // Update the nodes…
                    var node = vis.selectAll("g.node")
                        .data(nodes, function (d) {
                            return d.id || (d.id = ++i);
                        });

                    // Enter any new nodes at the parent's previous position.
                    var nodeEnter = node.enter().append("svg:g")
                        .attr("class", "node")
                        .attr("transform", function (d) {
                            return "translate(" + source.y0 + "," + source.x0 + ")";
                        });

                    if (editable) {
                        nodeEnter.on("click", function (d) {
                            selectNode.call(this, d);
                        });
                    } else {
                        nodeEnter.on("click", function (d) {
                            d.checked = !d.checked;
                            d3.select(this).select("g.checkbox").classed("checked", d.checked);
                        });
                    }


                    //inject content to node
                    InjectNodeContent(nodeEnter);

                    // Transition nodes to their new position.
                    var nodeUpdate = node
                        .transition()
                        .duration(duration)
                        .attr("transform", function (d) {
                            return "translate(" + d.y + "," + d.x + ")";
                        });

                    nodeUpdate.select("circle")
                        .attr("r", 4.5)
                        .style("fill", function (d) {
                            return d._children ? "lightsteelblue" : "#fff";
                        });

                    nodeUpdate.select("text")
                        .text(function (d) {
                            return d.name;
                        })
                        .style("fill-opacity", 1);

                    // Transition exiting nodes to the parent's new position.
                    var nodeExit = node.exit()
                        .transition()
                        .duration(duration)
                        .attr("transform", function (d) {
                            return "translate(" + source.y + "," + source.x + ")";
                        })
                        .remove();

                    nodeExit.select("circle")
                        .attr("r", 1e-6);

                    nodeExit.select("text")
                        .style("fill-opacity", 1e-6);

                    // Update the links…
                    var link = vis.selectAll("path.link")
                        .data(tree.links(nodes), function (d) {
                            return d.target.id;
                        });

                    // Enter any new links at the parent's previous position.
                    link.enter().insert("svg:path", "g")
                        .attr("class", "link")
                        .attr("d", function (d) {
                            var o = {x: source.x0, y: source.y0};
                            return diagonal({source: o, target: o});
                        })
                        .transition()
                        .duration(duration)
                        .attr("d", diagonal);

                    // Transition links to their new position.
                    link
                        .transition()
                        .duration(duration)
                        .attr("d", diagonal);

                    // Transition exiting nodes to the parent's new position.
                    link.exit()
                        .transition()
                        .duration(duration)
                        .attr("d", function (d) {
                            var o = {x: source.x, y: source.y};
                            return diagonal({source: o, target: o});
                        })
                        .remove();

                    // Stash the old positions for transition.
                    nodes.forEach(function (d) {
                        d.x0 = d.x;
                        d.y0 = d.y;
                    });
                }


                function InjectNodeContent(nodeEnter) {

                    var innerContainer = nodeEnter.append("svg:g")
                        .attr("class", "container");

                    innerContainer.append("svg:circle")
                        .attr("r", 1e-6)
                        .style("fill", function (d) {
                            return d._children ? "lightsteelblue" : "#fff";
                        })
                        .classed("toggleCircle", true);


                    var textNodes = innerContainer.append("svg:text")
                        .attr("x", function (d) {
                            return d.children || d._children ? -10 : 10;
                        })
                        .attr("dy", ".35em")
                        .attr("text-anchor", function (d) {
                            return d.children || d._children ? "end" : "start";
                        })
                        .text(function (d) {
                            return d.name;
                        })
                        .style("fill-opacity", 1e-6);



                    if (!editable) {
                        var checkbox = nodeEnter.append("svg:g")
                            .attr("class", "checkbox");

                        checkbox.append("svg:rect")
                            .attr("width", 15)
                            .attr("height", 15);
                        //.attr("y", "-.5em");

                        checkbox.append("svg:path")
                            .attr("d", "m0.184632,7.869125l5.520013,6.694498l8.926091,-12.147537l-8.590524,7.785162l-5.85558,-2.332122z");
                        //.attr("d", "-.5em");

                        checkbox.attr("transform", function (d, i) {
                            //var textNode = textNodes.filter((d, ei) => ei === i);

                            var textNode = d3.select(this.parentNode).select("text");

                            var side = -1;  //The text is on the left side
                            if (textNode.attr("text-anchor") === "start") side = 1; //The text is on the right side

                            var offsetX = side * (textNode.node().getBBox().width
                                + d3.select(this).select("rect").attr("width")
                                * (side === -1 ? 2 : 1));
                            return ("translate(" + offsetX + " -8)");
                        });
                    }
                }
            }
        };
}