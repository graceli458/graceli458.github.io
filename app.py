import dash_mantine_components as dmc
import dash_bootstrap_components as dbc
from dash import Dash, html, dcc
import dash_gif_component as gif

app = Dash(__name__)

header = dmc.Container(dmc.Title("Grace Li", order=1))

introduction = dmc.Paper(
    children=[
        dbc.Row([dmc.Text("Introduction", size="xl")]),
        dbc.Row([dmc.Text(["Hi! I'm Grace, a senior at Barnard college double majoring in Computer Science and English. I'm passionate about leveraging Large Language Models to streamline and innovate in industries like finance and education. My work at ", html.A("Morgan Stanley", href="https://www.morganstanley.com/"), " focused on operationalizing Machine Learning models to assist bankers in parsing annual reports for at-the-market programs and issuances to provide market research and drive business opportunities. \n\nMy research with Professor Lydia Chilton at the ", html.A("Columbia University Computational Design Lab", href="https://www.cs.columbia.edu/~chilton/"),  " utilizes a Large Language Model, GPT3, to create AI tools to improve the effectiveness of scientific writing. Through user testing, I aimed to create a human-centered program that fosters divergent and convergent thinking in the brainstorming process. I am interested in roles at the intersection of software development and user-interface design to make products more accessible."], style={'whiteSpace': 'pre-wrap'})])
        ],
    shadow="md",
    radius="lg",
    p="lg",
    withBorder=True
)

research = dmc.Paper(
    children=[
        dbc.Row([html.Div([
            html.Div(dmc.Image(src="/assets/techtweets.gif", width=25), style={"display":"inline-block", "align":"center"}),
            html.Div(dmc.Text("Tweetorial Hooks: Generative AI Tools to Motivate Science on Social Media", size="lg"), style={"display":"inline-block", "align":"center"})
        ])], style={"padding":"5px"}),
        dbc.Row([dmc.Text(["Tao Long, Dorothy Zhang, ", html.B("Grace Li"), ", Batool Taraif, Samia Menon, Kynnedy Smith, Sitong Wang, Katy Gero, Lydia Chilton"])], style={"padding":"5px"}),
        dbc.Row([dmc.Text(" ICCC 2023  Tweetorials are popular, but STEM experts struggle to make them engaging. Our system, HookIncubator, utilizes scaffolding and AI chaining with LLMs for co-creating compelling hooks. Our evaluation indicates reduced cognitive load and well-supported science contextualization. Users edits LLM outputs for personal style and clarity, enhancing ownership and motivating more readers.", size="sm")], style={"padding":"5px"}),
        dbc.Row([
            dbc.Col(html.A("PDF", href="assets/2023_TechTweetorial_ICCC.pdf")),
            dbc.Col(html.A("Project", href="http://language-play.com/tech-tweets/")),
            dbc.Col(html.A("Demo", href="http://taolongg.pythonanywhere.com/"))], style={"padding":"5px"}
            )
        # dbc.Row([dmc.Text("Research", size="xl")]),
        # dbc.Row([dmc.Text(["Currently, my research is focused on creativity support tools in field of Human-Computer Interaction (HCI). I'm interested in building multimodal generative AI systems that bolster creativity and divergent thinking.\n\nMy first research experience was with the ", html.A("Columbia Earth Institute", href="https://www.earth.columbia.edu/"), " as a ", html.A("Data Science Institute Scholar", href="https://urf.columbia.edu/fellowship/data-science-institute-dsi-and-data-good-scholars-program"), " identifying painpoints the workflows of climate catastrophe modelers at insurance companies to build a system to would increase productivity and alleviate friction between different stakeholders: underwriters, catastrophe modelers, and data gatherers."], style={'whiteSpace': 'pre-wrap'})])
    ],
    shadow="md",
    radius="lg",
    p="lg",
    withBorder=True,
)



app.layout = dmc.Container(
    children=[
        dbc.Row([
                dbc.Col(html.Div(""), width=3),
                dbc.Col(html.Div([
                    dmc.Container([header]), 
                    dmc.Container([introduction], style={"padding": "20px"}),
                    dmc.Container([research], style={"padding": "20px"})
                ])),
                dbc.Col(html.Div(""), width=3),
            ])
        
    ]
)

if __name__ == "__main__":
    app.run_server()