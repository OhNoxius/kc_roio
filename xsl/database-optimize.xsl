<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:msxsl="urn:schemas-microsoft-com:xslt" xmlns:ext="http://exslt.org/common" exclude-result-prefixes="ext msxsl">
	<xsl:output method="xml" doctype-public="-//W3C//DTD XHTML 1.0 Strict//EN" doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd" encoding="UTF-8"/>

	<xsl:variable name="linkedsheet" select="substring(local-name(/*[1]/*[starts-with(name(.), '_')]),2)"/>

	<xsl:template match="@*|node()">
		<xsl:copy>
			<xsl:apply-templates select="@*|node()"/>
		</xsl:copy>
	</xsl:template>

	<!--<xsl:template match="*[attribute::*[local-name() = substring(local-name(/*[1]/*[starts-with(name(.), '_')]), 2)]]">-->
	<xsl:template match="*[contains(@concerts, '&#xA;')]">
		<xsl:variable name="el" select="."/>
		<xsl:variable name="ids">
			<xsl:call-template name="split">
				<!--<xsl:with-param name="pText" select="attribute::*[local-name() = substring(local-name(/*[1]/*[starts-with(name(.), '_')]), 2)]" />-->
				<xsl:with-param name="pText" select="@concerts"/>
			</xsl:call-template>
		</xsl:variable>
		<xsl:for-each select="ext:node-set($ids)/*">
			<xsl:variable name="id" select="string(.)"/>
			<xsl:for-each select="$el">
				<xsl:copy>
					<xsl:apply-templates select="$el/@*[not(local-name() = $linkedsheet)]"/>
					<xsl:attribute name="concerts">
						<xsl:value-of select="$id"/>
					</xsl:attribute>
					<xsl:apply-templates select="$el/*"/>
					<!--<xsl:apply-templates select="$el/@*[local-name() = $linkedsheet]" mode="editID" />-->
					<!--Do something special for Node766, like add a certain string-->
					<!--<xsl:apply-templates select="$el/@*[not(local-name() = $linkedsheet)]"/>-->
				</xsl:copy>
			</xsl:for-each>
		</xsl:for-each>
	</xsl:template>

	<xsl:template match="*" mode="editID"> </xsl:template>

	<xsl:template name="split">
		<xsl:param name="pText"/>

		<xsl:choose>
			<xsl:when test="string-length($pText) = 0"/>
			<xsl:when test="contains($pText, '&#xA;')">
				<id>
					<xsl:value-of select="substring-before($pText, '&#xA;')"/>
				</id>
				<xsl:call-template name="split">
					<xsl:with-param name="pText" select="substring-after($pText, '&#xA;')"/>
				</xsl:call-template>
			</xsl:when>
			<xsl:otherwise>
				<id>
					<xsl:value-of select="$pText"/>
				</id>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

</xsl:stylesheet>
