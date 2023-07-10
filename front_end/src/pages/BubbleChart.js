import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import '../styles/sentiment.css';


const BubbleChart = ({ filepath }) => {
    const ref = useRef();

    useEffect(() => {
        if (!filepath) {
            return;
        
        }
        
        const categories = {
            environmental: [
                'clean', 'environmental', 'epa', 'sustainability', 'climate', 'warming', 'biofuels', 'biofuel',
                'green', 'renewable', 'solar', 'stewardship', 'wind', 'emission', 'emissions', 'ghg', 'ghgs',
                'greenhouse', 'atmosphere', 'emit', 'agriculture', 'deforestation', 'pesticide', 'pesticides',
                'wetlands', 'zoning', 'biodiversity', 'species', 'wilderness', 'wildlife', 'freshwater',
                'groundwater', 'water', 'cleaner', 'cleanup', 'coal', 'contamination', 'fossil', 'resource',
                'air', 'carbon', 'nitrogen', 'pollution', 'superfund', 'biphenyls', 'hazardous', 'householding',
                'pollutants', 'printing', 'recycling', 'toxic', 'waste', 'wastes', 'weee', 'recycle'],
            social:  [
                'citizen', 'citizens', 'csr', 'disabilities', 'disability', 'disabled', 'human', 'nations',
                'social', 'un', 'veteran', 'veterans', 'vulnerable', 'children', 'epidemic', 'health', 'healthy',
                'ill', 'illness', 'pandemic', 'childbirth', 'drug', 'medicaid', 'medicare', 'medicine', 'medicines',
                'hiv', 'alcohol', 'drinking', 'bugs', 'conformance', 'defects', 'fda', 'inspection', 'inspections',
                'minerals', 'standardization', 'warranty', 'dignity', 'discriminate', 'discriminated', 'discriminating',
                'discrimination', 'equality', 'freedom', 'humanity', 'nondiscrimination', 'sexual', 'communities',
                'community', 'expression', 'marriage', 'privacy', 'peace', 'bargaining', 'eeo', 'fairness', 'fla',
                'harassment', 'injury', 'labor', 'overtime', 'ruggie', 'sick', 'wage', 'wages', 'workplace', 'bisexual',
                'diversity', 'ethnic', 'ethnically', 'ethnicities', 'ethnicity', 'female', 'females', 'gay', 'gays',
                'gender', 'genders', 'homosexual', 'immigration', 'lesbian', 'lesbians', 'lgbt', 'minorities',
                'minority', 'ms', 'race', 'racial', 'religion', 'religious', 'sex', 'transgender', 'woman', 'women',
                'occupational', 'safe', 'safely', 'safety', 'ilo', 'labour', 'eicc', 'endowment', 'endowments',
                'people', 'philanthropic', 'philanthropy', 'socially', 'societal', 'society', 'welfare', 'charitable',
                'charities', 'charity', 'donate', 'donated', 'donates', 'donating', 'donation', 'donations', 'donors',
                'foundation', 'foundations', 'gift', 'gifts', 'nonprofit', 'poverty', 'courses', 'educate', 'educated',
                'educates', 'educating', 'education', 'educational', 'learning', 'mentoring', 'scholarships', 'teach',
                'teacher', 'teachers', 'teaching', 'training', 'employ', 'employment', 'headcount', 'hire', 'hired',
                'hires', 'hiring', 'staffing', 'unemployment'],
            governance: [
                'align', 'aligned', 'aligning', 'alignment', 'aligns', 'bylaw', 'bylaws', 'charter',
                'charters', 'culture', 'death', 'duly', 'parents', 'independent', 'compliance', 'conduct',
                'conformity', 'governance', 'misconduct', 'parachute', 'parachutes', 'perquisites', 'plane',
                'planes', 'poison', 'retirement', 'approval', 'approvals', 'approve', 'approved', 'approves',
                'approving', 'assess', 'assessed', 'assesses', 'assessing', 'assessment', 'assessments',
                'audit', 'audited', 'auditing', 'auditor', 'auditors', 'audits', 'control', 'controls', 'coso',
                'detect', 'detected', 'detecting', 'detection', 'evaluate', 'evaluated', 'evaluates', 'evaluating',
                'evaluation', 'evaluations', 'examination', 'examinations', 'examine', 'examined', 'examines',
                'examining', 'irs', 'oversee', 'overseeing', 'oversees', 'oversight', 'review', 'reviewed',
                'reviewing', 'reviews', 'rotation', 'test', 'tested', 'testing', 'tests', 'treadway', 'backgrounds',
                'independence', 'leadership', 'nomination', 'nominations', 'nominee', 'nominees', 'perspectives',
                'qualifications', 'refreshment', 'skill', 'skills', 'succession', 'tenure', 'vacancies', 'vacancy',
                'appreciation', 'award', 'awarded', 'awarding', 'awards', 'bonus', 'bonuses', 'cd', 'compensate',
                'compensated', 'compensates', 'compensating', 'compensation', 'eip', 'iso', 'isos', 'payout', 'payouts',
                'pension', 'prsu', 'prsus', 'recoupment', 'remuneration', 'reward', 'rewarding', 'rewards', 'rsu',
                'rsus', 'salaries', 'salary', 'severance', 'vest', 'vested', 'vesting', 'vests', 'ballot', 'ballots',
                'cast', 'consent', 'elect', 'elected', 'electing', 'election', 'elections', 'elects', 'nominate',
                'nominated', 'plurality', 'proponent', 'proponents', 'proposal', 'proposals', 'proxies', 'quorum',
                'vote', 'voted', 'votes', 'voting', 'brother', 'clicking', 'conflict', 'conflicts', 'family',
                'grandchildren', 'grandparent', 'grandparents', 'inform', 'insider', 'insiders', 'inspector',
                'inspectors', 'interlocks', 'nephews', 'nieces', 'posting', 'relatives', 'siblings', 'sister',
                'son', 'spousal', 'spouse', 'spouses', 'stepchildren', 'stepparents', 'transparency', 'transparent',
                'visit', 'visiting', 'visits', 'webpage', 'website', 'attract', 'attracting', 'attracts', 'incentive',
                'incentives', 'interview', 'interviews', 'motivate', 'motivated', 'motivates', 'motivating',
                'motivation', 'recruit', 'recruiting', 'recruitment', 'retain', 'retainer', 'retainers', 'retaining',
                'retention', 'talent', 'talented', 'talents', 'cobc', 'ethic', 'ethical', 'ethically', 'ethics',
                'honesty', 'bribery', 'corrupt', 'corruption', 'crimes', 'embezzlement', 'grassroots', 'influence',
                'influences', 'influencing', 'lobbied', 'lobbies', 'lobby', 'lobbying', 'lobbyist', 'lobbyists',
                'whistleblower', 'announce', 'announced', 'announcement', 'announcements', 'announces', 'announcing',
                'communicate', 'communicated', 'communicates', 'communicating', 'erm', 'fairly', 'integrity', 'liaison',
                'presentation', 'presentations', 'sustainable', 'asc', 'disclose', 'disclosed', 'discloses', 'disclosing',
                'disclosure', 'disclosures', 'fasb', 'gaap', 'objectivity', 'press', 'sarbanes', 'engagement',
                'engagements', 'feedback', 'hotline', 'investor', 'invite', 'invited', 'mail', 'mailed', 'mailing',
                'mailings', 'notice', 'relations', 'stakeholder', 'stakeholders', 'compact', 'ungc']
        };
        
        const currentRef = ref.current; // Copy ref.current to a variable
        
        fetch(`http://localhost:3000/word-cloud/${btoa(filepath)}/all`)
        .then(response => response.json())
        .then(rawData => {
            const data = Object.entries(rawData).map(([id, value]) => ({ id, value }));
            console.log(data);
         
            const width = 1500; // Changed from 928
            const height = width;
            const margin = 1;

            const format = d3.format(",d");

            const color = d => {
                const categoryColors = {
                    environmental: d3.scaleSequential([2, 8], d3.interpolateGreens),
                    social: d3.scaleSequential([7, 10], d3.interpolateOranges),
                    governance: d3.scaleSequential([7, 10], d3.interpolateBlues)
                };
                for (const [category, keywords] of Object.entries(categories)) {
                    if (keywords.includes(d.data.id)) {
                        return categoryColors[category](Math.random() * 10); // For the example, we use random numbers.
                    }
                }
                return '#ccc'; // Default color
            };
            

            const pack = d3.pack()
                .size([width - margin * 2, height - margin * 2])
                .padding(3);

            const hierarchyData = d3.hierarchy({ children: data })
                .sum(d => d.value);

            const root = pack(hierarchyData);

            const svg = d3.select(ref.current)
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("viewBox", [-margin, -margin, width, height])
                .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;")
                .attr("text-anchor", "middle");

            const node = svg.append("g")
              .selectAll("g")
              .data(root.leaves())
              .join("g")
                .attr("transform", d => `translate(${d.x},${d.y})`);

                node.append("circle")
                .attr("fill-opacity", 0.7)
                .attr("fill", color)
                .attr("r", d => d.r)
                .on("mouseover", function(event, d) {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("r", d.r * 1.2); // Increase size by 20%
            
                    // Add a text label for the word frequency
                    svg.append("text")
                        .attr("id", "hoverLabel")
                        .attr("x", event.pageX)
                        .attr("y", event.pageY - 15)
                        .text(`Frequency: ${d.data.value}`)
                        .attr("font-size", "12px")
                        .attr("fill", "#000");
                })
                .on("mouseout", function() {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("r", d => d.r); // Restore the original size
            
                    // Remove the text label
                    svg.select("#hoverLabel").remove();
                });
            

            node.append("text")
                .text(d => d.data.id)
                .attr("fill", "#000")
                .attr("font-size", "14px"); // Change the font size here

        });

        return () => {
            d3.select(currentRef).selectAll("svg").remove();
        }

    }, [filepath]);

    return (
        <div ref={ref}></div>
    );
};

export default BubbleChart;
