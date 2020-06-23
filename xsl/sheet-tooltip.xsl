<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output method="html" doctype-public="-//W3C//DTD XHTML 1.0 Strict//EN" doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd" encoding="UTF-8" />
	<xsl:param name="sheet" />
	<xsl:param name="id" />

	<xsl:template match="/">
		XSL TOOLTIP
		<!--<xsl:apply-templates select="/*[1]/*[local-name(.) = $sheet]/*[attribute::*[1] = $id]/attribute::*" mode="hover" />-->
	</xsl:template>

	<xsl:template match="attribute::*" mode="hover">
		<xsl:if test="string(.) != ''">
			<xsl:value-of select="local-name(.)" />
			<xsl:text>: </xsl:text>
			<xsl:value-of select="." />
			<xsl:text>&#10;</xsl:text>
		</xsl:if>
	</xsl:template>
</xsl:stylesheet>
