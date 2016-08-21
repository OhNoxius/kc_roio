<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" >
	
	<xsl:strip-space elements="festival"/>
	<xsl:strip-space elements="country"/>
	
	<xsl:key name="artist" match="artist" use="string()"/>
	<xsl:key name="country" match="country" use="string()"/>
	<xsl:key name="festival" match="festival" use="string()"/>
	<xsl:key name="date" match="date" use="string()"/>
	<!--	<xsl:strip-space elements="artist"/>-->

	<xsl:param name="chooseParameter"/>

	<xsl:template match="/">		
		<xsl:apply-templates select="//*[local-name()=$chooseParameter][generate-id() = generate-id(key($chooseParameter, string())[1])]">
			<xsl:sort select="." order="ascending"/>
		</xsl:apply-templates>
	</xsl:template>
	
	<xsl:template match="//*">
		<!--html datalist-->
		<option>
			<xsl:attribute name="value">
				<xsl:value-of select="."/>
			</xsl:attribute>
		</option>

		<!--css select-->
		<!--<option>
			<xsl:value-of select="."/>
		</option>	-->
	</xsl:template>

</xsl:stylesheet>
