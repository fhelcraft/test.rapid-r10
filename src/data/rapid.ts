// All content is taken from dtirapid.ph (landing page and article pages).
// Figures are project-wide across all 7 regions, as published on the source site.

import img147 from '../assets/news/147.jpg';
import img146 from '../assets/news/146.jpg';
import img145 from '../assets/news/145.jpg';
import img142 from '../assets/news/142.jpg';
import img140 from '../assets/news/140.jpg';
import img139 from '../assets/news/139.jpg';

export const SOURCE = 'https://dtirapid.ph';
export const link = (path: string) => `${SOURCE}${path}`;

export const about = {
	name: 'Rural Agro-enterprise Partnership for Inclusive Development and Growth',
	paragraphs: [
		'The Rural Agro-enterprise Partnership for Inclusive Development and Growth (RAPID Growth) Project is a flagship initiative of the Department of Trade and Industry (DTI) funded by the International Fund for Agricultural Development (IFAD) that aims to strengthen agro-enterprise development in rural communities across the Philippines.',
		'Through strategic investments, capacity building, and inclusive partnerships, the project supports sustainable enterprise growth and increased economic opportunities in rural communities.',
	],
	learnMore: link('/webrep_v2/whoweare'),
};

export const stats = {
	asOf: '30 September 2026',
	farmers: 84711,
	farmerOrgs: 876,
	msmes: 1049,
	regions: 7,
	provinces: 21,
	investments: 431491398,
	roads: 19,
	roadKm: 36.87,
	women: 41684,
	youth: 15138,
	ip: 15208,
	dashboard: link('/webrep_v2/dashboard'),
};

export const components = [
	{
		name: 'RAPID Growth Network',
		body: 'Links farmer organizations and agri-based MSMEs so they can grow as enterprises together.',
		figure: `${stats.farmerOrgs.toLocaleString('en-US')} farmer organizations and ${stats.msmes.toLocaleString('en-US')} MSMEs`,
		href: link('/webrep_v2/what_we_do#network'),
	},
	{
		name: 'Value Chain Development',
		body: 'Builds up the commodities rural communities depend on, from planting to market.',
		figure: 'Coffee, cacao and coconut in Northern Mindanao',
		href: link('/webrep_v2/what_we_do#network'),
	},
	{
		name: 'Rural Infrastructure',
		body: 'Farm-to-market roads that connect producers to buyers.',
		figure: `${stats.roads} roads covering ${stats.roadKm} km`,
		href: link('/webrep_v2/what_we_do#network'),
	},
];

// Map coordinates are approximate town centres, used only to place pins.
export const places = [
	{
		name: 'Naawan',
		province: 'Misamis Oriental',
		lat: 8.43,
		lon: 124.29,
		focus: 'Cacao tree planting and stakeholders’ meeting',
		article: 142,
	},
	{
		name: 'Lantapan',
		province: 'Bukidnon',
		lat: 8.0,
		lon: 124.98,
		focus: 'IFAD project demonstration visit',
		article: 147,
	},
	{
		name: 'Kadingilan',
		province: 'Bukidnon',
		lat: 7.6,
		lon: 124.91,
		focus: 'Coconut shell charcoal enterprise',
		article: 146,
	},
];

export const commodities = ['Coffee', 'Cacao', 'Coconut'];

export const news = [
	{
		id: 147,
		tag: 'News',
		date: '21 July 2026',
		place: 'Lantapan, Bukidnon',
		title: 'IFAD Project Demonstration Showcases RAPID Growth Project’s Proven Model for Scaling Sustainable Rural Development',
		summary: 'IFAD organized a Project Demonstration Visit to RAPID Growth Project sites in Bukidnon to showcase the gains from implementation.',
		image: img147,
		alt: 'The IFAD delegation and project partners in a group photo at the Cinchona Forest Reserve, Lantapan, Bukidnon',
	},
	{
		id: 146,
		tag: 'Story',
		date: '18 August 2026',
		place: 'Kadingilan, Bukidnon',
		title: 'From Coconut Waste to a Million-Peso Opportunity',
		summary: 'Baroy Small Coconut Farmers Agriculture Cooperative turned discarded coconut shells into ₱1.7 million in charcoal sales.',
		image: img146,
		alt: 'A truck loaded with sacks of coconut shell charcoal inside a warehouse',
	},
	{
		id: 145,
		tag: 'News',
		date: '18 August 2026',
		place: 'Bukidnon',
		title: 'DTI-RAPID Growth Project Launches Youth Champions’ Cascading Sessions for Bukidnon Youth Hubs',
		summary: 'A step toward stronger youth participation in agriculture and entrepreneurship across Bukidnon youth hubs.',
		image: img145,
		alt: 'Participants at the Youth Champions’ cascading session in Bukidnon',
	},
	{
		id: 142,
		tag: 'News',
		date: '16 January 2026',
		place: 'Naawan, Misamis Oriental',
		title: 'DTI–Misamis Oriental Joins Ceremonial Cacao Tree Planting and Stakeholders’ Meeting in Naawan',
		summary: 'A multi-sectoral effort to expand cacao production and strengthen the local cacao industry.',
		image: img142,
		alt: 'Ceremonial cacao tree planting in Barangay Mapulog, Naawan',
	},
	{
		id: 140,
		tag: 'News',
		date: '27 July 2026',
		place: 'Bukidnon',
		title: 'RAPID Growth Project Strengthens Monitoring of Coffee and Cacao Expansion Areas in Bukidnon',
		summary: 'Post-planting validation across coffee and cacao expansion areas in the province.',
		image: img140,
		alt: 'Young coffee plants on a hillside farm in Bukidnon',
	},
	{
		id: 139,
		tag: 'News',
		date: '20 July 2026',
		place: 'Bukidnon',
		title: 'IFAD Demonstration Visit Highlights RAPID Growth Project Gains in Bukidnon',
		summary: 'IFAD and national oversight agencies joined a two-day demonstration visit to project sites.',
		image: img139,
		alt: 'IFAD representatives during the demonstration visit in Bukidnon',
	},
].map((n) => ({ ...n, href: link(`/webrep_v2/article/${n.id}`) }));

export const contact = {
	address: '2/F, Mintrade Bldg., Monteverde St. corner Sales St., Davao City, Philippines 8000',
	links: [
		{ label: 'About the project', href: link('/webrep_v2/whoweare') },
		{ label: 'Where we work', href: link('/webrep_v2/whoweare#wherewework') },
		{ label: 'News and updates', href: link('/webrep_v2/news_and_updates') },
		{ label: 'Stories', href: link('/webrep_v2/stories') },
		{ label: 'Project updates and reports', href: link('/webrep_v2/knowledge_and_data') },
		{ label: 'Transparency and good governance', href: link('/webrep_v2/whoweare#transparency') },
	],
	dti: 'https://www.dti.gov.ph/',
	ifad: 'https://www.ifad.org/en/',
};
