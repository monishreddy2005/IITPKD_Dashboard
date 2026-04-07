import psycopg2, os; from dotenv import load_dotenv;
load_dotenv(); 
conn = psycopg2.connect(os.environ.get('DATABASE_URL'));
cur = conn.cursor();
query = """
    SELECT 
        CASE 
            WHEN engagement_type ILIKE '%Adjunct%' THEN 'Adjunct' 
            WHEN engagement_type ILIKE '%Honorary%' THEN 'Honorary' 
            WHEN engagement_type ILIKE '%Visiting%' THEN 'Visiting' 
            WHEN engagement_type ILIKE '%Faculty Fellow%' OR engagement_type ILIKE '%FacultyFellow%' THEN 'FacultyFellow' 
            WHEN engagement_type ILIKE '%PoP%' OR engagement_type ILIKE '%Professor of Practice%' OR engagement_type ILIKE '%Practice%' THEN 'PoP' 
            ELSE NULL 
        END AS std_type, 
        COUNT(*) 
    FROM faculty_engagement 
    GROUP BY std_type;
"""
cur.execute(query);
print(cur.fetchall());
conn.close()
