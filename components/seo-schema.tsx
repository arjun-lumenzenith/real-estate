export function SeoSchema() {

    const schema = {

        "@context":"https://schema.org",

        "@type":"RealEstateAgent",

        "name":"LumenZenith Realty OPC Pvt. Ltd.",

        "url":"https://www.lumenzenith.com",

        "logo":"https://www.lumenzenith.com/favicon.png",

        "telephone":"+919900891647",

        "email":"info@lumenzenith.com",

        "address":{

            "@type":"PostalAddress",

            "addressLocality":"Bengaluru",

            "addressRegion":"Karnataka",

            "addressCountry":"IN"

        }

    }

    return (

        <script

            type="application/ld+json"

            dangerouslySetInnerHTML={{

                __html: JSON.stringify(schema),

            }}

        />

    )

}