<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">

	<xsl:param name="chooseId"/>

	<xsl:variable name="smallcase" select="'abcdefghijklmnopqrstuvwxyz'"/>
	<xsl:variable name="uppercase" select="'ABCDEFGHIJKLMNOPQRSTUVWXYZ'"/>

	<xsl:strip-space elements="artist"/>

	<xsl:template match="/">

		<xsl:apply-templates select="//session[@id = $chooseId]"> </xsl:apply-templates>

	</xsl:template>

	<xsl:template match="//session">

		<xsl:value-of select="lineage"/><br></br>
		<xsl:value-of select="remarks"/>
		
		<!--
		<tr height="1">
			<td colspan="8" bgcolor="#CCCCCC"/>
		</tr>-->
		
	</xsl:template>

</xsl:stylesheet>
